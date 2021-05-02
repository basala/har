import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { map } from 'lodash';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';
import { ExecutionResponse } from '../restful/execution/execution.service';

@ObjectType()
@Entity({
    name: 'reports',
})
export class ReportEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Column()
    @Type(() => Buffer)
    @Exclude()
    content: Buffer[];

    @Field()
    @Column()
    @Expose()
    createAt: number;

    @Field()
    @Column()
    @Expose()
    updateAt: number;

    @Field()
    @Expose()
    get id(): string {
        return this._id;
    }

    constructor(config: Partial<ReportEntity>) {
        if (config) {
            Object.assign(
                this,
                plainToClass(ReportEntity, config, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
            this.createAt = this.createAt || Date.now();
            this.updateAt = this.updateAt || this.createAt;
            this.content = config.content;
        }
    }
}

@ObjectType()
export class FormatReport extends ReportEntity {
    @Field(() => GraphQLJSON)
    @Expose()
    report: ExecutionResponse[];

    constructor(report: ReportEntity) {
        super(report);

        this.report = map(this.content, item => {
            return JSON.parse(item.toString());
        });
    }
}
