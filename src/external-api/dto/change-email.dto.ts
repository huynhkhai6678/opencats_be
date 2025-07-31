import { IsDefined, IsString } from "class-validator";

export class ChangeEmailDto {
    @IsDefined()
    @IsString()
    unlock_key: string;

    @IsDefined()
    @IsString()
    new_email: string;
}