import { ProjectEntity } from '@entity';
import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { generateToken } from 'src/utils/auth';
import { getMongoRepository } from 'typeorm';
import { TestConnectionDto } from './account.dto';

@Controller('account')
@UsePipes(ValidationPipe)
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

        await generateToken(projectEnv.environment, {
            username,
            password,
        }).catch((error: Error) => {
            throw new BadRequestException(error.message);
        });

        return {
            valid: true,
        };
    }
}
