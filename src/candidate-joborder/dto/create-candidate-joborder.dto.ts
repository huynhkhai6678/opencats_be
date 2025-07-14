import { IsDefined, IsNumber } from "class-validator";

export class CreateCandidateJoborderDto {
    @IsDefined()
    @IsNumber()
    candidate_id: number;

    @IsDefined()
    @IsNumber()
    joborder_id: number;

    @IsDefined()
    @IsNumber()
    status: number;
}
