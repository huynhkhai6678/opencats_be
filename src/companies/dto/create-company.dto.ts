import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCompanyDto {
    @IsDefined()
    @IsString()
    name : string;

    @IsOptional()
    @IsString()
    phone1 : string;

    @IsOptional()
    @IsString()
    phone2 : string;

    @IsOptional()
    @IsString()
    fax_number : string;

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
    url : string;

    @IsOptional()
    @IsString()
    zip : string;

    @IsOptional()
    @IsString()
    notes : string;

    @IsOptional()
    @IsString()
    key_technologies : string;

    @IsOptional()
    @IsNumber()
    is_hot : number;

    @IsOptional()
    departments? : string;
}
