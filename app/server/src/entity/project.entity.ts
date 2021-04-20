import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass, Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { v4 } from 'uuid';

@ObjectType()
class ProjectEnvironment {
    @Field()
    @Expose()
    host: string;

    @Field()
    @Expose()
    authUrl: string;

    @Field()
    @Expose()
    authBody: string;

    @Field()
    @Expose()
    tokenPath: string;
}

@ObjectType()
@Entity({
    name: 'projects',
})
export class ProjectEntity {
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
    userId: string;

    @Field()
    @Column()
    @Type(() => ProjectEnvironment)
    @Expose()
    environment: ProjectEnvironment;

    @Field(() => Int)
    @Column()
    @Expose()
    createAt: number;

    @Field(() => Int)
    @Column()
    @Expose()
    updateAt: number;

    @Field()
    @Expose()
    get id(): string {
        return this._id;
    }

    constructor(project: Partial<ProjectEntity>) {
        if (project) {
            Object.assign(
                this,
                plainToClass(ProjectEntity, project, {
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
export class CreateProjectInput {
    @Field()
    @Expose()
    name: string;

    @Field(() => GraphQLJSON)
    @Type(() => ProjectEnvironment)
    @Expose()
    environment: ProjectEnvironment;
}

@InputType()
export class UpdateProjectInput extends CreateProjectInput {
    @Field()
    @Expose()
    id: string;
}
