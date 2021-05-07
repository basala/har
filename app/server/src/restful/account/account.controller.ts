import { RestAuthGuard } from '@auth';
import { ProjectEntity } from '@entity';
import {
    Body,
    Controller,
    ForbiddenException,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { generateToken } from '@utils';
import { isEmpty } from 'lodash';
import { getMongoRepository } from 'typeorm';
import { TestConnectionDto } from './account.dto';

@Controller('account')
@UsePipes(ValidationPipe)
@UseGuards(RestAuthGuard)
export class AccountController {
    @Post('connection')
    async testConnection(
        @Body() connection: TestConnectionDto
    ): Promise<{
        valid: boolean;
    }> {
        const { projectId, username, password } = connection;
        const projectEnv = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment'],
            where: {
                _id: projectId,
            },
        });

        if (!projectEnv) {
            throw new ForbiddenException('project does not exist');
        }

        const token = await generateToken(projectEnv.environment, {
            username,
            password,
        });

        return {
            valid: isEmpty(token.error),
        };
    }
}
