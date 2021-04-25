import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
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
    @Expose()
    _id: string;

    @Field()
    @Column()
    @Expose()
    parentId: string;

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

    constructor(issue: Partial<IssueEntity>) {
        if (issue) {
            Object.assign(
                this,
                plainToClass(IssueEntity, issue, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
            this.createAt = this.createAt || Date.now();
            this.updateAt = this.updateAt || this.createAt;
            this.data = issue.data;
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
