import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass, Type } from 'class-transformer';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';

@ObjectType()
@Entity({
    name: 'robots',
})
export class RobotEntity {
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
    url: string;

    @Field(() => [String])
    @Column()
    @Type(() => String)
    @Expose()
    members: string[];

    @Field()
    @Expose()
    get id(): string {
        return this._id;
    }

    constructor(config: Omit<RobotEntity, '_id'>) {
        if (config) {
            Object.assign(
                this,
                plainToClass(RobotEntity, config, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
        }
    }
}
