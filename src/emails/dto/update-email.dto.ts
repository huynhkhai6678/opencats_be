import { IsDefined, IsNumber, IsString } from "class-validator";

export class UpdateEmailDto {
    @IsDefined()
    @IsNumber()
    disabled : number;

    @IsDefined()
    @IsString()
    text : string;
}
