import { IsDefined, IsString } from "class-validator";

export class VerifyUserDto {
    @IsDefined()
    @IsString()
    verify_code: string;
}