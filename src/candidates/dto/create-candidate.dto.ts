import { Transform } from "class-transformer";
import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCandidateDto {
    @IsDefined()
    @IsString()
    first_name : string;

    @IsDefined()
    @IsString()
    last_name : string;

    @IsOptional()
    @IsString()
    full_name : string;

    @IsOptional()
    @IsString()
    web_site : string;

    @IsDefined()
    phone_work : string;

    @IsOptional()
    @IsString()
    address : string;

    @IsOptional()
    @IsString()
    city : string;

    @IsOptional()
    @IsString()
    state : string;

    @IsOptional()
    @IsString()
    zip : string;

    @IsOptional()
    source_id : number | string;

    @IsDefined()
    @IsString()
    job_title : string;

    @IsOptional()
    @Transform(({ value }) => {
    return value === '' ? 0 : parseInt(value, 10);
    })    
    @IsNumber()
    exp_years : number;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : Number(value))
    @IsNumber()
    can_relocate : number;

    @IsOptional()
    @IsString()
    date_available : string;

    @IsOptional()
    @IsString()
    current_employer : string;

    @IsOptional()
    @IsString()
    current_pay : string;

    @IsOptional()
    @IsString()
    desired_pay : string;

    @IsOptional()
    @IsString()
    language : string;

    @IsDefined()
    @IsString()
    key_skills : string;

    @IsOptional()
    @IsString()
    notes : string;
}
