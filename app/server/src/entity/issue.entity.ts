import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';
import { RequestType } from './scalar';

@ObjectType()
export class RequestData {
    @Field()
    @Expose()
    mimeType: string;

    @Field()
    @Type(() => Buffer)
    @Expose()
    text: Buffer;
}

@InputType()
export class RequestDataInput {
    @Field()
    @Expose()
    mimeType: string;

    @Field()
    @Expose()
    text: string;
}

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

    @Field(() => [String])
    @Column()
    @Expose()
    fields: string[];

    @Column()
    @Type(() => RequestData)
    @Exclude()
    postData: RequestData;

    @Column()
    @Type(() => RequestData)
    @Exclude()
    content: RequestData;

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
            content: RequestDataInput;
            postData: RequestDataInput;
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
            this.content = {
                mimeType: issue.content.mimeType,
                text: Buffer.from(issue.content.text, 'utf-8'),
            };
            this.postData = {
                mimeType: issue.postData.mimeType,
                text: Buffer.from(issue.postData.text, 'utf-8'),
            };
        }
    }
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
    content: RequestDataInput;

    @Field()
    @Expose()
    postData: RequestDataInput;

    @Field(() => [String])
    @Expose()
    fields: string[];
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
