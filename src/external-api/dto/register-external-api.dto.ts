import { IsDefined, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class RegisterExternalApi {
    @IsDefined()
    @IsNumber()
    type: number;

    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    referral_code: string;

    @IsDefined()
    @IsString()
    password: string;
}