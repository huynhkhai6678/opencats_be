import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
    @Expose()
    user_id : number;

    @Expose()
    user_name: string;

    @Expose()
    email: string;

    @Expose()
    first_name: string;

    @Expose()
    last_name: string;

    @Exclude()
    password: string;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}