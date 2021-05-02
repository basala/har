import {
    AccountEntity,
    IssueEntity,
    ProjectEntity,
    ProjectEnvironment,
    RequestType,
} from '@entity';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
} from '@nestjs/common';
import { generateToken } from '@utils';
import axios from 'axios';
import { flatten, isEqual, map, pick } from 'lodash';
import { getMongoRepository } from 'typeorm';

export interface ExecutionResponse {
    success: boolean;
    data: {
        refer: any;
        actual: any;
        id: string;
        name: string;
        url: string;
        method: RequestType;
        accountName: string;
        projectName: string;
        host: string;
    };
    error?: string;
}

@Injectable()
export class ExecutionService {
    async executeProject(id: string): Promise<ExecutionResponse[]> {
        const project = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment', 'name'],
            where: {
                _id: id,
            },
        });

        if (!project) {
            throw new ForbiddenException('project does not exist');
        }

        const accounts = await getMongoRepository(AccountEntity).find({
            select: ['id', 'environment', 'name'],
            where: {
                projectId: id,
            },
        });

        return flatten(
            await Promise.all(
                map(accounts, async account => {
                    const token = await generateToken(
                        project.environment,
                        account.environment
                    );

                    const issues = await getMongoRepository(IssueEntity).find({
                        select: [
                            'url',
                            'method',
                            'postData',
                            'content',
                            'fields',
                            'id',
                            'name',
                        ],
                        where: {
                            accountId: account.id,
                        },
                    });

                    if (token.error) {
                        return map(issues, issue => {
                            return {
                                success: false,
                                error: token.error,
                                data: {
                                    refer: '',
                                    actual: '',
                                    id: issue.id,
                                    name: issue.name,
                                    url: issue.url,
                                    method: issue.method,
                                    accountName: account.name,
                                    projectName: project.name,
                                    host: project.environment.host,
                                },
                            };
                        });
                    }

                    return await Promise.all(
                        map(issues, async issue => {
                            const res = await this.executeSingle(
                                project.environment,
                                issue,
                                token.token
                            );

                            return {
                                ...res,
                                data: {
                                    ...res.data,
                                    id: issue.id,
                                    name: issue.name,
                                    url: issue.url,
                                    method: issue.method,
                                    accountName: account.name,
                                    projectName: project.name,
                                    host: project.environment.host,
                                },
                            };
                        })
                    );
                })
            )
        );
    }

    async executeAccount(id: string): Promise<ExecutionResponse[]> {
        const account = await getMongoRepository(AccountEntity).findOne({
            select: ['environment', 'projectId', 'name'],
            where: {
                _id: id,
            },
        });

        if (!account) {
            throw new ForbiddenException('account does not exist');
        }

        const project = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment', 'name'],
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
        );

        if (token.error) {
            throw new BadRequestException(token.error);
        }

        const issues = await getMongoRepository(IssueEntity).find({
            select: [
                'url',
                'method',
                'postData',
                'content',
                'fields',
                'id',
                'name',
            ],
            where: {
                accountId: account.id,
            },
        });

        return await Promise.all(
            map(issues, async issue => {
                const res = await this.executeSingle(
                    project.environment,
                    issue,
                    token.token
                );

                return {
                    ...res,
                    data: {
                        ...res.data,
                        id: issue.id,
                        name: issue.name,
                        url: issue.url,
                        method: issue.method,
                        accountName: account.name,
                        projectName: project.name,
                        host: project.environment.host,
                    },
                };
            })
        );
    }

    async executeIssue(id: string): Promise<ExecutionResponse[]> {
        const issue = await getMongoRepository(IssueEntity).findOne({
            select: [
                'url',
                'method',
                'postData',
                'content',
                'accountId',
                'fields',
                'name',
            ],
            where: {
                _id: id,
            },
        });

        if (!issue) {
            throw new ForbiddenException('issue does not exist');
        }

        const account = await getMongoRepository(AccountEntity).findOne({
            select: ['environment', 'projectId', 'name'],
            where: {
                _id: issue.accountId,
            },
        });

        if (!account) {
            throw new ForbiddenException('account does not exist');
        }

        const project = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment', 'name'],
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
        );

        if (token.error) {
            throw new BadRequestException(token.error);
        }

        const res = await this.executeSingle(
            project.environment,
            issue,
            token.token
        );

        return [
            {
                ...res,
                data: {
                    ...res.data,
                    id,
                    name: issue.name,
                    url: issue.url,
                    method: issue.method,
                    accountName: account.name,
                    projectName: project.name,
                    host: project.environment.host,
                },
            },
        ];
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
        data?: {
            refer: any;
            actual: any;
        };
        error?: string;
    }> {
        const { pathname, search } = new URL(issue.url);
        try {
            // Logger.log(`Checking ${pathname + search} start`, 'Execution');
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
            const refer = pick(content, issue.fields);
            const actual = pick(response.data, issue.fields);

            // Logger.log(`Check ${pathname + search} finished`, 'Execution');
            return {
                success: isEqual(refer, actual),
                data: {
                    refer,
                    actual,
                },
            };
        } catch (error) {
            Logger.error(
                `Check ${pathname + search} error`,
                error.stack,
                'Execution'
            );
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
