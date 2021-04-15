import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';
import { RequestType } from './scalar';

@ObjectType()
@Entity({
    name: 'issues',
})
export class IssueEntity {
    @ObjectIdColumn()
    @Index()
    @Expose()
    _id: string;

    @Field()
    @Column()
    @Expose()
    url: number;

    @Field(() => RequestType)
    @Column()
    @Expose()
    method: RequestType;

    @Field(() => GraphQLJSON)
    @Column()
    @Expose()
    data: JSON;

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
