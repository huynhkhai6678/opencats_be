import { IsDefined, IsInt, IsNumber, IsString } from "class-validator";

export class CreateListDto {
    @IsDefined()
    @IsNumber()
    data_item_type: number;

    @IsDefined()
    @IsString()
    description: string;

    @IsDefined()
    @IsInt({ each: true })
    entries: [];
}
