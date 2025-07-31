import { IsDefined, IsString } from "class-validator";

export class LoginExternalApi {
    @IsDefined()
    @IsString()
    username: string;

    @IsDefined()
    @IsString()
    password: string;
}