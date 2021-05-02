import { CurrentUser, GQLAuthGuard } from '@auth';
import {
    CreateRobotInput,
    RobotEntity,
    UpdateRobotInput,
    UserEntity,
} from '@entity';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError, ForbiddenError } from 'apollo-server-errors';
import { plainToClass } from 'class-transformer';
import { getMongoRepository } from 'typeorm';

@Resolver('Robot')
@UseGuards(GQLAuthGuard)
export class RobotResolver {
    @Query(() => [RobotEntity])
    async findAllRobots(
        @CurrentUser() user: UserEntity
    ): Promise<RobotEntity[]> {
        const robots = await getMongoRepository(RobotEntity).find({
            select: ['name', 'webhook', 'mentioned_list', 'updateAt', 'id'],
            where: {
                userId: user.id,
            },
        });

        return robots;
    }

    @Mutation(() => RobotEntity)
    async createRobot(
        @Args('input') input: CreateRobotInput,
        @CurrentUser() user: UserEntity
    ): Promise<RobotEntity> {
        const existedRobot = await getMongoRepository(RobotEntity).findOne({
            name: input.name,
            userId: user.id,
        });

        if (existedRobot) {
            throw new ForbiddenError('Account already exists.');
        }

        const createRobot = await getMongoRepository(RobotEntity).save(
            new RobotEntity({
                ...input,
                userId: user.id,
            })
        );

        return createRobot;
    }

    @Mutation(() => RobotEntity)
    async updateRobot(
        @Args('input') input: UpdateRobotInput,
        @CurrentUser() user: UserEntity
    ): Promise<RobotEntity> {
        try {
            const existedRobot = await getMongoRepository(RobotEntity).findOne({
                _id: input.id,
                userId: user.id,
            });

            if (!existedRobot) {
                throw new ForbiddenError('Robot does not exists.');
            }

            const value = {
                ...input,
                updateAt: Date.now(),
            };
            await getMongoRepository(RobotEntity).update(
                {
                    _id: input.id,
                },
                value
            );

            return plainToClass(
                RobotEntity,
                {
                    ...existedRobot,
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

    @Mutation(() => RobotEntity)
    async deleteRobot(
        @Args('id') id: string,
        @CurrentUser() user: UserEntity
    ): Promise<RobotEntity> {
        try {
            const existedRobot = await getMongoRepository(RobotEntity).findOne({
                _id: id,
                userId: user.id,
            });

            if (!existedRobot) {
                throw new ForbiddenError('Robot does not exists.');
            }

            await getMongoRepository(RobotEntity).delete({
                _id: id,
            });

            return existedRobot;
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}
