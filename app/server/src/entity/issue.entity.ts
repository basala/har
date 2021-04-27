import { Field, InputType, ObjectType } from '@nestjs/graphql';
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
    accountId: string;

    @Field()
    @Column()
    @Expose()
    name: string;

    @Field()
    @Column()
    @Expose()
    url: string;

    @Field(() => RequestType)
    @Column()
    @Expose()
    method: RequestType;

    @Column()
    @Type(() => Buffer)
    @Exclude()
    postData: Buffer;

    @Column()
    @Type(() => Buffer)
    @Exclude()
    content: Buffer;

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

    constructor(
        issue: Omit<Partial<IssueEntity>, 'content' | 'postData'> & {
            content: string;
            postData: string;
        }
    ) {
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
            this.content = Buffer.from(issue.content, 'utf-8');
            this.postData = Buffer.from(issue.postData, 'utf-8');
        }
    }
}

@ObjectType()
export class FormatIssueEntity extends IssueEntity {
    @Field(() => GraphQLJSON)
    @Type(() => Buffer)
    @Expose()
    content: Buffer;
}

@InputType()
export class CreateIssuesInput {
    @Field()
    @Expose()
    name: string;

    @Field()
    @Expose()
    url: string;

    @Field(() => RequestType)
    @Type()
    @Expose()
    method: RequestType;

    @Field()
    @Expose()
    content: string;

    @Field()
    @Expose()
    postData: string;
}

@InputType()
export class UpdateIssueInput {
    @Field()
    @Expose()
    id: string;

    @Field()
    @Expose()
    name: string;
}
