import {
  IsDefined,
  IsString,
} from 'class-validator';

export class ChangePasswordDto {
  @IsDefined()
  @IsString()
  old_password: string;

  @IsDefined()
  @IsString()
  new_password: string;

  @IsDefined()
  @IsString()
  confirm_password: string;
}