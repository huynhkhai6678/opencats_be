import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    password : string;

    @IsOptional()
    confirm_password : string;

    @IsOptional()
    @IsBoolean()
    is_reset_password : boolean;
}
