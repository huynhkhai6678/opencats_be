import { Transform } from "class-transformer";
import { IsDefined, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
import { Match } from "src/decorators/match.decorator";

export class CreateUserDto {
    @IsDefined()
    @IsString()
    first_name : string;

    @IsDefined()
    @IsString()
    last_name : string;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsEmail()
    email : string;

    @IsDefined()
    @IsString()
    user_name : string;

    @IsDefined()
    @IsString()
    password : string;

    @IsDefined()
    @IsString()
    @Match('password', { message: 'Confirm password does not match' })
    confirm_password : string;

    @IsDefined()
    @IsNumber()
    access_level : number;
}
