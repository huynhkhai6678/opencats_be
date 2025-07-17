import { IsBoolean, IsDefined, IsNumber, IsString } from "class-validator";

export class UpdateRatingDto {
    @IsDefined()
    @IsNumber()
    status: number;

    @IsDefined()
    @IsBoolean()
    change_status: number;

    @IsDefined()
    @IsBoolean()
    create_activity: number;

    @IsDefined()
    @IsNumber()
    activity_type: number;

    @IsDefined()
    @IsString()
    activity_notes: number;
}
