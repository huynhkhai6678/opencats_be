import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateContactDto {
    @IsDefined()
    @IsString()
    first_name : string;

    @IsDefined()
    @IsString()
    last_name : string;

    @IsDefined()
    @IsNumber()
    company_id : number;

    @IsDefined()
    @IsString()
    title : string;

    @IsOptional()
    @IsString()
    email : string;

    @IsOptional()
    @IsString()
    email1 : string;

    @IsOptional()
    @IsString()
    phone_work : string;

    @IsOptional()
    @IsString()
    phone_cell : string;

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
    @IsNumber()
    reports_to : number;

    @IsOptional()
    @IsNumber()
    is_hot : number;

    @IsOptional()
    @IsString()
    notes : string;

    @IsOptional()
    @IsString()
    company_department_id : number;
}
