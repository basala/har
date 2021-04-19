import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { authenticateJWT } from './jwt';

@Injectable()
export class GQLAuthGuard extends AuthGuard('jwt') implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        const authHeader = <string>req.headers.authorization;

        if (!authHeader) {
            throw new BadRequestException('Authorization header not found.');
        }

        const { data, info } = await authenticateJWT(req);

        if (!data) {
            throw new UnauthorizedException(info?.message);
        }

        req.user = data;

        return true;
    }
}
