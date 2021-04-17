import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass } from 'class-transformer';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';
import { RecordType } from './scalar';

@ObjectType()
@Entity({
    name: 'records',
})
export class RecordEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Field(() => RecordType)
    @Column()
    @Expose()
    type: RecordType;

    @Field()
    @Column()
    @Expose()
    parentId: string;

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

    constructor(issue: Partial<RecordEntity>) {
        if (issue) {
            Object.assign(
                this,
                plainToClass(RecordEntity, issue, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
            this.createAt = this.createAt || Date.now();
            this.updateAt = this.updateAt || this.createAt;
        }
    }
}
