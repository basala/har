import { GQLAuthGuard } from '@auth';
import {
    AccountEntity,
    CreateAccountInput,
    IssueEntity,
    ProjectEntity,
    UpdateAccountInput,
} from '@entity';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { plainToClass } from 'class-transformer';
import { getMongoRepository } from 'typeorm';

@Resolver('Account')
@UseGuards(GQLAuthGuard)
export class AccountResolver {
    @Query(() => [AccountEntity])
    async findAllAccounts(
        @Args('input') projectId: string
    ): Promise<AccountEntity[]> {
        try {
            const project = await getMongoRepository(ProjectEntity).findOne({
                _id: projectId,
            });

            if (!project) {
                throw new ApolloError('project does not exist');
            }

            const accounts = await getMongoRepository(AccountEntity).find({
                select: ['id', 'name', 'environment'],
                where: {
                    projectId,
                },
            });

            return accounts;
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Mutation(() => AccountEntity)
    async createAccount(
        @Args('input') input: CreateAccountInput
    ): Promise<AccountEntity> {
        const existedProject = await getMongoRepository(AccountEntity).findOne({
            projectId: input.projectId,
            name: input.name,
        });

        if (existedProject) {
            throw new ForbiddenError('Account already exists.');
        }

        const createAccount = await getMongoRepository(AccountEntity).save(
            new AccountEntity(input)
        );

        return createAccount;
    }

    @Mutation(() => AccountEntity)
    async updateAccount(
        @Args('input') input: UpdateAccountInput
    ): Promise<AccountEntity> {
        try {
            const existedProject = await getMongoRepository(
                AccountEntity
            ).findOne({
                _id: input.id,
            });

            if (!existedProject) {
                throw new ForbiddenError('Project does not exists.');
            }

            const value = {
                environment: input.environment,
                name: input.environment.username,
                updateAt: Date.now(),
            };
            await getMongoRepository(AccountEntity).update(
                {
                    _id: input.id,
                },
                value
            );

            return plainToClass(
                AccountEntity,
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

    @Mutation(() => AccountEntity)
    async deleteAccount(@Args('id') id: string): Promise<AccountEntity> {
        try {
            const existedProject = await getMongoRepository(
                AccountEntity
            ).findOne({
                _id: id,
            });

            if (!existedProject) {
                throw new ForbiddenError('Project does not exists.');
            }
            await Promise.all([
                getMongoRepository(AccountEntity).deleteMany({
                    _id: id,
                }),
                getMongoRepository(IssueEntity).deleteMany({
                    accountId: id,
                }),
            ]);

            return existedProject;
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}
