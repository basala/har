import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { encryptPassword } from '@utils';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';

@ObjectType()
@Entity({
    name: 'users',
})
export class UserEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Field()
    @Column()
    @Expose()
    username: string;

    @Field()
    @Column()
    @Exclude()
    salt: string;

    @Field()
    @Column()
    @Exclude()
    password: string;

    @Field({ nullable: true })
    @Column()
    @Expose()
    email?: string;

    @Field(() => Int)
    @Column()
    @Expose()
    createAt: number;

    @Field(() => Int)
    @Column()
    @Expose()
    updatedAt: number;

    @Field()
    @Expose()
    get id(): string {
        return this._id;
    }

    constructor(user: Partial<UserEntity>) {
        if (user) {
            Object.assign(
                this,
                plainToClass(UserEntity, user, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
            this.createAt = this.createAt || Date.now();
            this.updatedAt = this.updatedAt || this.createAt;

            this.salt = user.salt;
            this.password = user.password;
        }
    }

    validPassword(password: string): boolean {
        return this.password === encryptPassword(password, this.salt);
    }
}

@InputType()
export class CreateUserInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@InputType()
export class LoginUserInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
export class LoginResponse {
    @Field()
    token: string;

    @Field()
    userId: string;

    @Field()
    username: string;
}

@ObjectType()
export class VerifyTokenResponse {
    @Field()
    valid: boolean;
}
