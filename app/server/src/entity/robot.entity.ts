import { Field, InputType, ObjectType } from '@nestjs/graphql';
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
    userId: string;

    @Field()
    @Column()
    @Expose()
    name: string;

    @Field()
    @Column()
    @Expose()
    webhook: string;

    @Field(() => [String])
    @Column()
    @Type(() => String)
    @Expose()
    mentioned_list: string[];

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

    constructor(config: Partial<RobotEntity>) {
        if (config) {
            Object.assign(
                this,
                plainToClass(RobotEntity, config, {
                    excludeExtraneousValues: true,
                })
            );

            this._id = this._id || v4();
            this.createAt = this.createAt || Date.now();
            this.updateAt = this.updateAt || this.createAt;
        }
    }
}

@InputType()
export class CreateRobotInput {
    @Field()
    @Expose()
    name: string;

    @Field()
    @Expose()
    webhook: string;

    @Field(() => [String])
    @Type(() => String)
    @Expose()
    mentioned_list: string[];
}

@InputType()
export class UpdateRobotInput extends CreateRobotInput {
    @Field()
    @Expose()
    id: string;
}
