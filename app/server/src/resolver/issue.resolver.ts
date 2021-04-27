import { GQLAuthGuard } from '@auth';
import { CreateIssuesInput, IssueEntity } from '@entity';
import {
    ClassSerializerInterceptor,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { getMongoRepository } from 'typeorm';

@Resolver('Issue')
@UseGuards(GQLAuthGuard)
export class IssueResolver {
    @Mutation(() => [IssueEntity])
    @UseInterceptors(ClassSerializerInterceptor)
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
}
