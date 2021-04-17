import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';
import { RequestType } from './scalar';

@ObjectType()
@Entity({
    name: 'issues',
})
export class IssueEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Field()
    @Column()
    @Expose()
    name: string;

    @Field()
    @Column()
    @Expose()
    url: number;

    @Field(() => RequestType)
    @Column()
    @Expose()
    method: RequestType;

    @Column()
    @Type(() => Buffer)
    @Exclude()
    data: Buffer;

    @Field()
    @Expose()
    get id(): string {
        return this._id;
    }

    constructor(issue: Partial<IssueEntity>) {
        if (issue) {
            Object.assign(
                this,
                plainToClass(IssueEntity, issue, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
        }
    }
}

@ObjectType()
export class FormatIssueEntity extends IssueEntity {
    @Field(() => GraphQLJSON)
    @Type(() => Buffer)
    @Expose()
    data: Buffer;
}
