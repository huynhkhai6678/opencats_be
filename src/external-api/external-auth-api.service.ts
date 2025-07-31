import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginExternalApi } from './dto/login-external-api.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterExternalApi } from './dto/register-external-api.dto';
import * as crypto from 'crypto';
import { VerifyUserDto } from './dto/verify-user-api.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { KafkaDelayService } from '../services/kafka-delay.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { REQUEST } from '@nestjs/core';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangeEmailDto } from './dto/change-email.dto';


@Injectable()
export class ExternalAuthApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaDelayService,
    private readonly jwtService: JwtService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async login(loginExternalApi : LoginExternalApi) {
    const user = await this.prisma.external_users.findFirst({
      where : {
        OR: [
          { email: loginExternalApi.username },
          { phone: loginExternalApi.username }
        ]
      }
    });

    if (user) {
      const normalizedHash = user.password.replace(/^\$2y\$/, '$2b$');
      const isPasswordValid = await bcrypt.compare(loginExternalApi.password, normalizedHash);

			if (isPasswordValid) {
				if (user.verified) {
          const data = await this.getUser(user.id);
          return {
            data,
            tokenID : await this.jwtService.signAsync(data),
            message: "Request Success",
            code: 1
          }

				} else {
          return {
            code: 1,
            message: 'Your account is not verifed yet, please check your email to verify the account!'
          }
				}

			} else {
        return {
          code: 1,
          message: 'Invalid password, please try again'
        }
			}
		} else {
			return {
        code: 1,
        message: 'Invalid Email or Phone number, please try again'
      }
		}
  }

  async register(registerExternalApi : RegisterExternalApi) {
    const user = await this.prisma.external_users.findFirst({
      where : {
        OR: [
          { email: registerExternalApi.email },
          { phone: registerExternalApi.phone }
        ]
      }
    });

    if (user) {
      return {
        code: 1,
        message: 'Email or Phone number is existed, please try to login instead!n'
      }
    }

    const normalizedHash = await this.generateHashPassword(registerExternalApi.password);
    const unixTimestamp = this.generateTimeUnix();
    const verifyCode = this.generateToken();

    await this.prisma.external_users.create({
      data : {
        ...registerExternalApi,
        password: normalizedHash,
        register_date : unixTimestamp,
        verified: false,
        verify_code: verifyCode
      }
    });

    //Send email

    return {
      verify_code: verifyCode,
      message: "Request Success",
      code: 1
    }
  }

  async verifyUser(verifyUserDto : VerifyUserDto) {
    const user = await this.prisma.external_users.findFirst({
      where : {
        verify_code : verifyUserDto.verify_code
      }
    });

    if (!user) {
      return {
        code: 1,
        message: 'Invalid verification code!'
      }
    }

    await this.prisma.external_users.update({
      where : {
        id : user.id
      },
      data : {
        verified: true
      }
    })

    return {
      message: "Request Success",
      code: 0
    }
  }

  async getUser(id: number) {
    const user = await this.prisma.external_users.findUnique({
      where: {
        id
      },
      include : {
        profile: true
      }
    });

    return {
      id: user?.id,
      name: user?.name,
      referral_code: user?.referral_code,
      email: user?.email,
      phone: user?.phone,
      type: user?.type,
      job_title: user?.profile?.job_title,
      citizen_id: user?.profile?.citizen_id,
      citizen_issued_date: user?.profile?.citizen_issued_date,
      citizen_issued_place: user?.profile?.citizen_issued_place,
      beneficiary_bank: user?.profile?.beneficiary_bank,
      bank_account: user?.profile?.bank_account,
      is_employee: user?.is_employee
    }
  }

  async forgetPassword( forgetPasswordDto: ForgetPasswordDto) {
    const user = await this.prisma.external_users.findFirst({
      where : {
        OR: [
          { email: forgetPasswordDto.username },
          { phone: forgetPasswordDto.username }
        ]
      }
    });

    if (!user) {
      return {
        code: 1,
        message: 'Your given account doesn\'t exit!'
      }
    }

    const token = this.generateToken();
    const last30Min = this.generateTimeUnix()-  30 * 60;
    // Delete forget password history
    await this.prisma.forget_password.deleteMany({
      where : {
        login_time : {
          lte : last30Min
        }
      }
    })

    // Add forget password record
    await this.prisma.forget_password.create({
      data : {
        token,
        user_id: user.id,
        login_time : this.generateTimeUnix()
      }
    });

    // Send mail
    const email = await this.prisma.email_template.findFirst({
      where: {
        tag : 'EMAIL_TEMPLATE_FORGET_PASSWORD'
      }
    });

    if (!email) {
      return {
        code: 1,
        message: 'Email template not found'
      }
    }

    const previewContent = `${email.text?.replace('%USERNAME%', user.name).replace('%TOKEN_CODE%', token)}`;

    await this.kafkaService.sendEmail({
      to: user.email,
      subject: email.title,
      html: previewContent,
    });

    // DO IT IN FUTURE
    // await this.kafkaService.sendEmail({
    //   to: 'contact@dtalent.dev',
    //   subject: email.title,
    //   html: previewContent,
    // });

    return {
      token,
      message: "Request Success",
      code: 0
    }
  }

  async verifiyResetPassword(token: string) {
    const forgetPassword = await this.prisma.forget_password.findFirst({
      where : {
        token
      }
    });

    if (forgetPassword) {
      return {
        code: 0,
        tokenID: token,
        message: 'Request Success'
      }
    } else {
      return {
        code: 1,
        message: 'Invalid reset password code, please make another request!'
      }
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const forgetPassword = await this.prisma.forget_password.findFirst({
      where : {
        token: resetPasswordDto.token
      }
    });

    if (forgetPassword) {
      const password = await this.generateHashPassword(resetPasswordDto.new_password);
      await this.prisma.external_users.update({
        where : {
          id : forgetPassword.user_id
        },
        data : {
          password
        }
      });

      await this.prisma.forget_password.deleteMany({
        where : {
          token : forgetPassword.token
        }
      });

      return {
        code: 0,
        message: 'Request Success'
      }
    } else {
      return {
        code: 1,
        message: 'Invalid reset password code, please make another request!'
      }
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const user = this.request.user;
    const dbUser = await this.prisma.external_users.findUnique({
      where : {
        id : user.id
      }
    });

    const normalizedHash = dbUser?.password.replace(/^\$2y\$/, '$2b$');
    const isPasswordValid = await bcrypt.compare(changePasswordDto.old_password, normalizedHash);

    if (dbUser && isPasswordValid) {
      const newPassword = await this.generateHashPassword(changePasswordDto.new_password);
      await this.prisma.external_users.update({
        where : {
          id : user.id
        },
        data : {
          password : newPassword
        }
      });

      return {
        code: 0,
        message: 'Request Success'
      }
    } else {
      return {
        code: 1,
        message: 'Old password is not correct, please try again!'
      }
    }
    
  }

  async updateProfile(updateProfileDto: UpdateProfileDto) {
    const user = this.request.user;
    const dbUser = await this.prisma.external_users.findFirst({
      where : {
        NOT: {
          id: user.id,
        },
        phone : updateProfileDto.phone
      }
    });

    if (dbUser) {
      return {
        code: 1,
        message: 'The new phone number was registered by another account!'
      }
    }

    await this.prisma.external_users.update({
      where : {
        id : user.id
      },
      data : {
        name : updateProfileDto.name,
        phone: updateProfileDto.phone
      }
    });

    const data = {
      job_title : updateProfileDto.job_title,
      citizen_id : updateProfileDto.citizen_id,
      citizen_issued_date : new Date(updateProfileDto.citizen_issued_date),
      citizen_issued_place : updateProfileDto.job_title,
      beneficiary_bank : updateProfileDto.beneficiary_bank,
      bank_account : updateProfileDto.bank_account,
    }

    const profile = await this.prisma.external_user_profile.findUnique({
      where : {
        user_id : user.id
      }
    });

    if (profile) {
      // Edit
      await this.prisma.external_user_profile.update({
        where : {
          user_id : user.id
        },
        data
      });
    } else {
      // Create
      await this.prisma.external_user_profile.create({
        data : {
          ...data,
          user_id : user.id
        }
      });
    }

    return {
      code: 0,
      message: 'Request Success'
    }
  }

  async unlockChangeEmail(password : string) {
    const user = this.request.user;
    const dbUser = await this.prisma.external_users.findFirst({
      where : {
        id: user.id,
      }
    });

    const isPass = await this.passwordVerify(dbUser?.password, password);
    if (isPass) {
      const key = await this.prisma.unlock_keys.create({
        data : {
          unlock_key: this.generateToken(),
          user_id: user.id,
          create_time : this.generateTimeUnix()
        }
      })
      return {
        data : {
          unlock_key : key.unlock_key
        },
        code: 0,
        message: 'Verify Successfully'
      }
    }

    return {
      code: 1,
      message: 'Password is not correct, please try again!'
    }
  }

  async changeEmail(changeEmailDto: ChangeEmailDto) {
    const user = this.request.user;
    const key = await this.prisma.unlock_keys.findFirst({
      where : {
        unlock_key: changeEmailDto.unlock_key,
        user_id: user.id
      }
    });

    if (key) {
      const dbUser = await this.prisma.external_users.findFirst({
        where : {
          NOT : {
            id: user.id
          },
          email : changeEmailDto.new_email
        }
      });

      if (dbUser) {
        return {
          code: 1,
          message: 'This email was registered by another account!'
        }
      }

      await this.prisma.external_users.update({
        where : {
          id: user.id
        },
        data : {
          email : changeEmailDto.new_email
        }
      });

      return {
        code: 0,
        message: 'Verify Successfully'
      }
    } else {
      return {
        code: 1,
        message: 'Invalid change email request, please contact system Admin'
      }
    }
  }

  async passwordVerify(currentPassword, comparePassword) {
    const normalizedHash = currentPassword.replace(/^\$2y\$/, '$2b$');
    return await bcrypt.compare(comparePassword, normalizedHash);
  }

  async generateHashPassword(password) {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword.replace(/^\$2b\$/, '$2y$');
  }

  generateToken() {
    const randomValue = Math.random().toString(36).substring(2);
    return crypto.createHash('md5').update(randomValue).digest('hex');
  }

  generateTimeUnix() {
    return Math.floor(new Date().getTime() / 1000);
  }
}

