import { GQLAuthGuard } from '@auth';
import { CreateIssuesInput, IssueEntity, UpdateIssueInput } from '@entity';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { plainToClass } from 'class-transformer';
import { getMongoRepository } from 'typeorm';

@Resolver('Issue')
@UseGuards(GQLAuthGuard)
export class IssueResolver {
    @Mutation(() => [IssueEntity])
    async createIssues(
        @Args('hars', { type: () => [CreateIssuesInput] })
        hars: CreateIssuesInput[],
        @Args('position') position: string
    ): Promise<IssueEntity[]> {
        try {
            const issues = await getMongoRepository(IssueEntity).save(
                hars.map(issue => {
                    return new IssueEntity({
                        ...issue,
                        accountId: position,
                        parentId: position,
                    });
                })
            );

            return issues;
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Query(() => [IssueEntity])
    async findAllIssues(@Args('input') id: string): Promise<IssueEntity[]> {
        try {
            const issues = await getMongoRepository(IssueEntity).find({
                select: ['id', 'name', 'url', 'method'],
                where: {
                    accountId: id,
                },
            });

            return issues;
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Mutation(() => IssueEntity)
    async updateIssue(
        @Args('input') input: UpdateIssueInput
    ): Promise<IssueEntity> {
        try {
            const existedIssue = await getMongoRepository(IssueEntity).findOne({
                _id: input.id,
            });

            if (!existedIssue) {
                throw new ForbiddenError('Project does not exists.');
            }

            const value = {
                name: input.name,
                updateAt: Date.now(),
            };
            await getMongoRepository(IssueEntity).update(
                {
                    _id: input.id,
                },
                value
            );

            return plainToClass(
                IssueEntity,
                {
                    ...existedIssue,
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

    @Mutation(() => IssueEntity)
    async deleteIssue(@Args('id') id: string): Promise<IssueEntity> {
        try {
            const existedIssue = await getMongoRepository(IssueEntity).findOne({
                _id: id,
            });

            if (!existedIssue) {
                throw new ForbiddenError('issue does not exists.');
            }
            await getMongoRepository(IssueEntity).delete({
                _id: id,
            });

            return existedIssue;
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}
