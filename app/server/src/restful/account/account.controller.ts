import { ProjectEntity } from '@entity';
import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import axios from 'axios';
import { get, isEmpty } from 'lodash';
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
            throw new BadRequestException('project does not exist');
        }
        const { host, authUrl, authBody, tokenPath } = projectEnv.environment;

        try {
            const response = await axios.post(
                host + authUrl,
                JSON.parse(
                    authBody
                        .replace('$username', username)
                        .replace('$password', password)
                )
            );

            if (response.status === 200) {
                const token = get(response.data, JSON.parse(tokenPath));

                return {
                    valid: !isEmpty(token),
                };
            } else {
                throw new Error(
                    '校验失败, 请检查账号密码是否正确或者工程配置是否正确'
                );
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
