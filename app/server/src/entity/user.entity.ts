import { Field, Int, ObjectType } from '@nestjs/graphql';
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

    @Field()
    @Column()
    @Expose()
    name: string;

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
        }
    }

    validPassword(password: string): boolean {
        return this.password === encryptPassword(password, this.salt);
    }
}
