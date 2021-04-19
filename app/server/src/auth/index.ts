import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export * from './auth.guard';
export * from './jwt';
export * from './passport';

export const CurrentUser = createParamDecorator<any, ExecutionContext>(
    (_data, context) => {
        const ctx = GqlExecutionContext.create(context);

        return ctx.getContext().req.user;
    }
);
