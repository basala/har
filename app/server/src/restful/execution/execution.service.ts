import {
    AccountEntity,
    IssueEntity,
    ProjectEntity,
    ProjectEnvironment,
} from '@entity';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
} from '@nestjs/common';
import axios from 'axios';
import { every, get, isEqual, map } from 'lodash';
import { generateToken } from 'src/utils/auth';
import { getMongoRepository } from 'typeorm';

@Injectable()
export class ExecutionService {
    async executeProject(id: string) {
        return 'project' + id;
    }

    async executeAccount(id: string) {
        const account = await getMongoRepository(AccountEntity).findOne({
            select: ['environment', 'projectId'],
            where: {
                _id: id,
            },
        });

        if (!account) {
            throw new ForbiddenException('account does not exist');
        }

        const project = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment'],
            where: {
                _id: account.projectId,
            },
        });

        if (!project) {
            throw new ForbiddenException('project does not exist');
        }

        const token = await generateToken(
            project.environment,
            account.environment
        ).catch((error: Error) => {
            throw new BadRequestException(error.message);
        });

        const issues = await getMongoRepository(IssueEntity).find({
            select: ['url', 'method', 'postData', 'content', 'fields', 'id'],
            where: {
                accountId: account.id,
            },
        });

        return await Promise.all(
            map(issues, async issue => {
                return this.executeSingle(project.environment, issue, token);
            })
        );
    }

    async executeIssue(
        id: string
    ): Promise<{
        success: boolean;
    }> {
        const issue = await getMongoRepository(IssueEntity).findOne({
            select: [
                'url',
                'method',
                'postData',
                'content',
                'accountId',
                'fields',
            ],
            where: {
                _id: id,
            },
        });

        if (!issue) {
            throw new ForbiddenException('issue does not exist');
        }

        const account = await getMongoRepository(AccountEntity).findOne({
            select: ['environment', 'projectId'],
            where: {
                _id: issue.accountId,
            },
        });

        if (!account) {
            throw new ForbiddenException('account does not exist');
        }

        const project = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment'],
            where: {
                _id: account.projectId,
            },
        });

        if (!project) {
            throw new ForbiddenException('project does not exist');
        }

        const token = await generateToken(
            project.environment,
            account.environment
        ).catch((error: Error) => {
            throw new BadRequestException(error.message);
        });

        return await this.executeSingle(project.environment, issue, token);
    }

    /**
     * 执行单个用例
     * @param projectEnv
     * @param issue
     * @param token
     * @returns
     */
    async executeSingle(
        projectEnv: ProjectEnvironment,
        issue: IssueEntity,
        token: string
    ): Promise<{
        success: boolean;
        error?: Error;
    }> {
        const { pathname, search } = new URL(issue.url);
        try {
            Logger.log(`Checking ${pathname + search} start`, 'Execution');
            const response = await axios({
                url: pathname + search,
                baseURL: projectEnv.host,
                method: issue.method,
                data: JSON.parse(issue.postData.toString()),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).catch((error: Error) => {
                throw new Error(error.message);
            });
            const content = JSON.parse(issue.content.toString());

            const allMatched = every(issue.fields, field => {
                return isEqual(get(response.data, field), get(content, field));
            });

            Logger.log(`Check ${pathname + search} finished`, 'Execution');
            return {
                success: allMatched,
            };
        } catch (error) {
            Logger.error(
                `Check ${pathname + search} error`,
                error.stack,
                'Execution'
            );
            return {
                success: false,
                error: error,
            };
        }
    }
}
