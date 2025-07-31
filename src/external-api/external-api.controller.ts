import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { AuthGuard } from '../guards/auth.guard';
import { ExternalAuthApiService } from './external-auth-api.service';
import { LoginExternalApi } from './dto/login-external-api.dto';
import { RegisterExternalApi } from './dto/register-external-api.dto';
import { VerifyUserDto } from './dto/verify-user-api.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ExternalJobsApiService } from './external-jobs-api.service';
import { ExternalPipelineApiService } from './external-pipeline-api.service';
import { ExternalCandidateApiService } from './external-candidate-api.service';
import { HeadhuntsService } from 'src/headhunts/headhunts.service';

// @UseGuards(AuthGuard)
@Controller('external_api')
export class ExternalApiController {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly externalJobApiService: ExternalJobsApiService,
    private readonly externalPipelineApiService: ExternalPipelineApiService,
    private readonly externalCandidateApiService: ExternalCandidateApiService,
    private readonly headhuntService: HeadhuntsService,
    private readonly externalAuthService: ExternalAuthApiService
  ) {}

  @Post('login')
  login(@Body(ValidationPipe) loginExternalApi: LoginExternalApi) {
    return this.externalAuthService.login(loginExternalApi);
  }

  @Post('register')
  register(@Body(ValidationPipe) registerExternalApi: RegisterExternalApi) {
    return this.externalAuthService.register(registerExternalApi);
  }

  @Post('verify_user')
  verifyUser(@Body(ValidationPipe) verifyUserDto: VerifyUserDto) {
    return this.externalAuthService.verifyUser(verifyUserDto);
  }

  @Post('forget_password')
  forgetPassword(@Body(ValidationPipe) forgetPasswordDto: ForgetPasswordDto) {
    return this.externalAuthService.forgetPassword(forgetPasswordDto);
  }

  @Post('verify_reset_password')
  verifiyResetPassword(@Body('token') token: string) {
    return this.externalAuthService.verifiyResetPassword(token);
  }

  @Post('reset_password')
  resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.externalAuthService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Post('change_password')
  changePassword(@Body(ValidationPipe) changePassword: ChangePasswordDto) {
    return this.externalAuthService.changePassword(changePassword);
  }

  @UseGuards(AuthGuard)
  @Post('update_profile')
  updateProfile(@Body(ValidationPipe) updateProfileDto: UpdateProfileDto) {
    return this.externalAuthService.updateProfile(updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Post('unlock')
  unlockChangeEmail(@Body('password') password: string) {
    return this.externalAuthService.unlockChangeEmail(password);
  }

  @UseGuards(AuthGuard)
  @Post('change_email')
  changeEmail(@Body(ValidationPipe) changeEmailDto: ChangeEmailDto) {
    return this.externalAuthService.changeEmail(changeEmailDto);
  }

  @Post('home')
  homeApi() {
    return this.externalApiService.homeApi();
  }

  @Post('job_detail')
  getJobDetail(@Body('job_id') jobId: string) {
    return this.externalJobApiService.getJobDetail(jobId);
  }
  
  @Post('subscribe')
  createSubscription(@Body('email') email: string) {
    return this.externalApiService.createSubscription(email);
  }

  @UseGuards(AuthGuard)
  @Post('get_dashboard')
  getDashboard() {
    return this.externalApiService.getDashboard();
  }

  @UseGuards(AuthGuard)
  @Post('my_jobs')
  getMyJob() {
    return this.externalJobApiService.getMyJob();
  }

  @UseGuards(AuthGuard)
  @Post('add_job')
  addFavoriteJob(@Body('job_id', ParseIntPipe) jobId: number) {
    return this.externalJobApiService.addFavoriteJob(jobId);
  }

  @UseGuards(AuthGuard)
  @Post('remove_job')
  removeFavoriteJob(@Body('job_id', ParseIntPipe) jobId: number) {
    return this.externalJobApiService.removeFavoriteJob(jobId);
  }

  @UseGuards(AuthGuard)
  @Post('get_candidate_pipelines')
  getCandidatePipelines() {
    return this.externalPipelineApiService.getCandidatePipelines();
  }

  @UseGuards(AuthGuard)
  @Post('get_owner_placed')
  getOwnerPlace() {
    return this.externalPipelineApiService.getOwnerPlace();
  }

  @UseGuards(AuthGuard)
  @Post('get_owner_pipelines')
  getOwnerPipeline() {
    return this.externalPipelineApiService.getOwnerPipeline();
  }

  @UseGuards(AuthGuard)
  @Post('my_candidates')
  getMyCandidates() {
    return this.externalCandidateApiService.getMyCandidates();
  }

  @Post('confirm_job')
  confirmJob(@Body() body: any) {
    return this.externalApiService.confirmJob(body);
  }

  @Post('confirm_job_req')
  confirmJobRequest(@Body() body: any) {
    return this.externalApiService.confirmJobRequest(body);
  }

  @UseGuards(AuthGuard)
  @Post('kpi_query')
  getKpiQuery(@Body('month') month: number) {
    return this.headhuntService.getKpiQuery(month);
  }
}
