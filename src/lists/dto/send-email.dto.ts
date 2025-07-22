import { IsDefined, IsInt, IsNumber, IsString } from "class-validator";

export class SendEmailDto {
    @IsDefined()
    @IsString()
    email_body: string;

    @IsDefined()
    @IsString()
    email_subject: string;

    @IsDefined()
    @IsInt()
    list_id: number;

    @IsDefined()
    @IsString()
    type: string;
}