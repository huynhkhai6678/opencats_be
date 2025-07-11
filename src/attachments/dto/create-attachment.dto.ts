import { Transform } from "class-transformer";
import { IsDefined, IsNumber } from "class-validator";

export class CreateAttachmentDto {
    @IsDefined()
    @Transform(({ value }) => value === '' ? undefined : Number(value))
    @IsNumber()
    data_item_id : number;

    @IsDefined()
    @Transform(({ value }) => value === '' ? undefined : Number(value))
    @IsNumber()
    data_type_id : number;
}
