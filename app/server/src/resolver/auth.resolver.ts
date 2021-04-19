import { authenticateLocal, generateToken, GQLAuthGuard } from '@auth';
import { LoginResponse, LoginUserInput, VerifyTokenResponse } from '@entity';
import {
    ClassSerializerInterceptor,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

@Resolver('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthResolver {
    @UseGuards(GQLAuthGuard)
    @Query(() => VerifyTokenResponse)
    async verifyToken(
        @Args('token') token: string
    ): Promise<VerifyTokenResponse> {
        return {
            valid: true,
        };
    }

    @Mutation(() => LoginResponse)
    async login(
        @Args('input') user: LoginUserInput,
        @Context()
        context: any
    ): Promise<any> {
        const { req } = context;

        req.body = {
            ...user,
        };

        const { data, info } = await authenticateLocal(req);

        if (data) {
            const token = await generateToken(data);

            return {
                token,
                userId: data.id,
                username: data.username,
            };
        }

        if (info) {
            const { message } = info;

            throw new ApolloError(message);
        }
    }
}
