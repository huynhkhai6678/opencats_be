import { IsBoolean, IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCalendarEventDto {
    @IsDefined()
    @IsString()
    title: string;

    @IsDefined()
    @IsNumber()
    duration: number;

    @IsDefined()
    @IsNumber()
    type: number;

    @IsDefined()
    @IsBoolean()
    public: number;

    @IsDefined()
    @IsBoolean()
    all_day: number;

    @IsDefined()
    @IsString()
    date: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    time: string;
}
