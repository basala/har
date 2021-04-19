import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { encryptPassword, makeSalt } from '@utils';
import { ApolloError, ForbiddenError } from 'apollo-server-express';
import { getMongoRepository } from 'typeorm';
import { CreateUserInput, UserEntity } from '../entity/user.entity';

@Resolver('User')
@UseInterceptors(ClassSerializerInterceptor)
export class UserResolver {
    @Query(() => UserEntity)
    async user(@Args('id') id: string): Promise<UserEntity> {
        try {
            const user = await getMongoRepository(UserEntity).findOne({
                _id: id,
            });

            if (!user) {
                throw new ForbiddenError('User not found.');
            }

            return user;
        } catch (error) {
            throw new ApolloError(error);
        }
    }

    @Mutation(() => UserEntity)
    async createUser(
        @Args('input') input: CreateUserInput
    ): Promise<UserEntity> {
        try {
            const existedUser = await getMongoRepository(UserEntity).findOne({
                username: input.username,
            });

            if (existedUser) {
                throw new ForbiddenError('User already exists.');
            }

            const salt = makeSalt();
            const createUser = await getMongoRepository(UserEntity).save(
                new UserEntity({
                    ...input,
                    salt,
                    password: encryptPassword(input.password, salt),
                })
            );

            return createUser;
        } catch (e) {
            throw new ApolloError(e);
        }
    }
}
