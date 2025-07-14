import { IsDefined, IsNumber, IsString } from "class-validator";

export class UpdateActivityDto {
    @IsDefined()
    @IsNumber()
    type: number;

    @IsDefined()
    @IsString()
    date_created: string;

    @IsDefined()
    @IsString()
    notes: string;
}
