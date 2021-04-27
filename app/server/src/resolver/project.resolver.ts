import { CurrentUser, GQLAuthGuard } from '@auth';
import {
    AccountEntity,
    CreateProjectInput,
    IssueEntity,
    ProjectEntity,
    UpdateProjectInput,
    UserEntity,
} from '@entity';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { makeId } from '@utils';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { plainToClass } from 'class-transformer';
import { getMongoRepository } from 'typeorm';

@Resolver('Project')
@UseGuards(GQLAuthGuard)
export class ProjectResolver {
    @Query(() => ProjectEntity)
    async project(@Args('id') id: string): Promise<ProjectEntity> {
        try {
            return await getMongoRepository(ProjectEntity).findOne({
                select: ['_id', 'userId', 'name'],
                where: {
                    _id: id,
                },
            });
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Query(() => [ProjectEntity])
    async findAllProjects(
        @CurrentUser() user: UserEntity
    ): Promise<ProjectEntity[]> {
        try {
            const projects = await getMongoRepository(ProjectEntity).find({
                select: ['id', 'name', 'environment'],
                where: {
                    userId: user.id,
                },
            });

            return projects;
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Mutation(() => ProjectEntity)
    async createProject(
        @Args('input') input: CreateProjectInput,
        @CurrentUser() user: UserEntity
    ): Promise<ProjectEntity> {
        const existedProject = await getMongoRepository(ProjectEntity).findOne({
            name: input.name,
            userId: user.id,
        });

        if (existedProject) {
            throw new ForbiddenError('Project already exists.');
        }

        const id = await this.getPrivateId(input.name);
        const createProject = await getMongoRepository(ProjectEntity).save(
            new ProjectEntity({
                _id: id,
                ...input,
                userId: user._id.toString(),
            })
        );

        return createProject;
    }

    @Mutation(() => ProjectEntity)
    async updateProject(
        @Args('input') input: UpdateProjectInput,
        @CurrentUser() user: UserEntity
    ): Promise<ProjectEntity> {
        try {
            const existedProject = await getMongoRepository(
                ProjectEntity
            ).findOne({
                _id: input.id,
                userId: user.id,
            });

            if (!existedProject) {
                throw new ForbiddenError('Project does not exists.');
            }

            const value = {
                name: input.name,
                environment: input.environment,
                updateAt: Date.now(),
            };
            await getMongoRepository(ProjectEntity).update(
                {
                    _id: input.id,
                },
                value
            );

            return plainToClass(
                ProjectEntity,
                {
                    ...existedProject,
                    ...value,
                },
                {
                    excludeExtraneousValues: true,
                }
            );
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Mutation(() => ProjectEntity)
    async deleteProject(
        @Args('id') id: string,
        @CurrentUser() user: UserEntity
    ): Promise<ProjectEntity> {
        try {
            const existedProject = await getMongoRepository(
                ProjectEntity
            ).findOne({
                _id: id,
                userId: user.id,
            });

            if (!existedProject) {
                throw new ForbiddenError('Project does not exists.');
            }
            const accounts = await getMongoRepository(AccountEntity).find({
                select: ['id'],
                where: {
                    projectId: id,
                },
            });

            await Promise.all([
                getMongoRepository(ProjectEntity).deleteMany({
                    _id: id,
                }),
                getMongoRepository(AccountEntity).deleteMany({
                    projectId: id,
                }),
                ...accounts.map(async account => {
                    return getMongoRepository(IssueEntity).deleteMany({
                        accountId: account.id,
                    });
                }),
            ]);

            return existedProject;
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    private async getPrivateId(name: string, l = 6): Promise<string> {
        const id = `${name}-${makeId(l)}`;

        const existedProject = await getMongoRepository(ProjectEntity).findOne({
            _id: id,
        });

        if (existedProject) {
            return await this.getPrivateId(name, l + 1);
        }

        return id;
    }
}
