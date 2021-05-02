import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass, Type } from 'class-transformer';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';

@ObjectType()
@Entity({
    name: 'reports',
})
export class ReportEntity {
    @ObjectIdColumn()
    @Expose()
    _id: string;

    @Field(() => [Buffer])
    @Column()
    @Type(() => Buffer)
    @Expose()
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
        }
    }
}
