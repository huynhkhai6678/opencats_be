import { IsDefined, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsDefined()
    @IsString()
    token: string;

    @IsDefined()
    @IsString()
    new_password : string;
}