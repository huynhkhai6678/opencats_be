import { IsDefined, IsString } from "class-validator";

export class ForgetPasswordDto {
    @IsDefined()
    @IsString()
    username: string;
}