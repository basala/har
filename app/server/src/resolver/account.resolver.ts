import { GQLAuthGuard } from '@auth';
import { AccountEntity, CreateAccountInput } from '@entity';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { getMongoRepository } from 'typeorm';

@Resolver('Account')
@UseGuards(GQLAuthGuard)
export class AccountResolver {
    @Query(() => [AccountEntity])
    async findAllAccounts(
        @Args('input') projectId: string
    ): Promise<AccountEntity[]> {
        try {
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
            throw new ForbiddenError('Project already exists.');
        }

        const createAccount = await getMongoRepository(AccountEntity).save(
            new AccountEntity(input)
        );

        return createAccount;
    }

    // @Mutation(() => ProjectEntity)
    // async updateProject(
    //     @Args('input') input: UpdateProjectInput,
    //     @CurrentUser() user: UserEntity
    // ): Promise<ProjectEntity> {
    //     try {
    //         const existedProject = await getMongoRepository(
    //             ProjectEntity
    //         ).findOne({
    //             _id: input.id,
    //             userId: user.id,
    //         });

    //         if (!existedProject) {
    //             throw new ForbiddenError('Project does not exists.');
    //         }

    //         const value = {
    //             name: input.name,
    //             environment: input.environment,
    //             updateAt: Date.now(),
    //         };
    //         await getMongoRepository(ProjectEntity).update(
    //             {
    //                 _id: input.id,
    //             },
    //             value
    //         );

    //         return plainToClass(
    //             ProjectEntity,
    //             {
    //                 ...existedProject,
    //                 ...value,
    //             },
    //             {
    //                 excludeExtraneousValues: true,
    //             }
    //         );
    //     } catch (error) {
    //         throw new ApolloError(error);
    //     }
    // }

    // @Mutation(() => ProjectEntity)
    // async deleteProject(
    //     @Args('id') id: string,
    //     @CurrentUser() user: UserEntity
    // ): Promise<ProjectEntity> {
    //     try {
    //         const existedProject = await getMongoRepository(
    //             ProjectEntity
    //         ).findOne({
    //             _id: id,
    //             userId: user.id,
    //         });

    //         if (!existedProject) {
    //             throw new ForbiddenError('Project does not exists.');
    //         }
    //         await getMongoRepository(ProjectEntity).delete({
    //             _id: id,
    //         });

    //         return existedProject;
    //     } catch (error) {
    //         throw new ApolloError(error);
    //     }
    // }
}
