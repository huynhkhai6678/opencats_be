import { IsDefined, IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsString()
    phone: string;

    @IsDefined()
    @IsString()
    job_title: string;

    @IsDefined()
    @IsString()
    citizen_id: string;

    @IsDefined()
    @IsString()
    citizen_issued_date: string;

    @IsDefined()
    @IsString()
    citizen_issued_place: string;

    @IsDefined()
    @IsString()
    beneficiary_bank: string;

    @IsDefined()
    @IsString()
    bank_account: string;
}