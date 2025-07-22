import { Transform } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class CreateActivityDto {
    joborder_id : number;

    @IsNumber()
    @Transform(({ value }) => value === '' ? undefined : Number(value))
    data_item_id: number;

    @IsNumber()
    @Transform(({ value }) => value === '' ? undefined : Number(value))
    data_item_type: number;

    @IsNumber()
    @Transform(({ value }) => value === '' ? undefined : Number(value))
    type: number;

    @IsString()
    notes: string;
}
