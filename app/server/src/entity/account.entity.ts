import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';

@ObjectType()
class AccountEnvironment {
    @Field()
    @Column()
    @Expose()
    username: string;

    @Field()
    @Column()
    @Exclude()
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
    @Type(() => AccountEnvironment)
    @Expose()
    environment: AccountEnvironment;

    @Field(() => Int)
    @Column()
    @Index()
    @Expose()
    createAt: number;

    @Field(() => Int)
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

@ObjectType()
@Entity({
    name: 'test',
})
export class TestEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Field()
    @Expose()
    @Column()
    u: string;
}
