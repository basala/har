import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass, Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';

@ObjectType()
export class AccountEnvironment {
    @Field()
    @Expose()
    username: string;

    @Field()
    @Expose()
    password: string;
}

@ObjectType()
@Entity({
    name: 'accounts',
})
export class AccountEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Field()
    @Column()
    @Expose()
    projectId: string;

    @Field()
    @Column()
    @Expose()
    name: string;

    @Field()
    @Column()
    @Type(() => AccountEnvironment)
    @Expose()
    environment: AccountEnvironment;

    @Field()
    @Column()
    @Index()
    @Expose()
    createAt: number;

    @Field()
    @Column()
    @Index()
    @Expose()
    updateAt: number;

    @Field()
    @Expose()
    get id(): string {
        return this._id;
    }

    constructor(issue: Partial<AccountEntity>) {
        if (issue) {
            Object.assign(
                this,
                plainToClass(AccountEntity, issue, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
            this.createAt = this.createAt || Date.now();
            this.updateAt = this.updateAt || this.createAt;
        }
    }
}

@InputType()
export class CreateAccountInput {
    @Field()
    @Expose()
    projectId: string;

    @Field()
    @Expose()
    name: string;

    @Field(() => GraphQLJSON)
    @Type(() => AccountEnvironment)
    @Expose()
    environment: AccountEnvironment;
}

@InputType()
export class UpdateAccountInput {
    @Field()
    @Expose()
    id: string;

    @Field()
    @Expose()
    name: string;

    @Field(() => GraphQLJSON)
    @Type(() => AccountEnvironment)
    @Expose()
    environment: AccountEnvironment;
}
