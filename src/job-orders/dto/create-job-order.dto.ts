import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateJobOrderDto {
    @IsDefined()
    @IsNumber()
    company_id : number;

    @IsDefined()
    @IsString()
    title : string;

    @IsOptional()
    @IsNumber()
    contact_id : number;

    @IsDefined()
    @IsString()
    city : string;

    @IsDefined()
    @IsString()
    state : string;

    @IsDefined()
    @IsNumber()
    recruiter : number;

    @IsDefined()
    @IsNumber()
    owner : number;

    @IsOptional()
    @IsString()
    start_date : string;
    
    @IsOptional()
    @IsString()
    duration : string;

    @IsOptional()
    @IsString()
    job_category : string;

    @IsOptional()
    @IsString()
    rate_max : string;

    @IsOptional()
    @IsString()
    type : string;

    @IsOptional()
    @IsString()
    salary : string;

    @IsOptional()
    @IsNumber()
    opening : string;

    @IsOptional()
    @IsString()
    commission : string;

    @IsOptional()
    @IsNumber()
    is_hot : number;

    @IsOptional()
    @IsString()
    brief_description : string;

    @IsOptional()
    @IsString()
    description : string;

    @IsOptional()
    @IsString()
    notes : string;

    @IsOptional()
    @IsString()
    departments? : string;
}
