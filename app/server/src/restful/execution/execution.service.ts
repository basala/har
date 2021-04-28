import { AccountEntity, IssueEntity, ProjectEntity } from '@entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { every, get } from 'lodash';
import { generateToken } from 'src/utils/auth';
import { getMongoRepository } from 'typeorm';

@Injectable()
export class ExecutionService {
    async executeProject(id: string) {
        return 'project' + id;
    }

    async executeAccount(id: string) {
        return 'account' + id;
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
            throw new BadRequestException('issue does not exist');
        }

        const account = await getMongoRepository(AccountEntity).findOne({
            select: ['environment', 'projectId'],
            where: {
                _id: issue.accountId,
            },
        });

        if (!account) {
            throw new BadRequestException('issue does not exist');
        }

        const project = await getMongoRepository(ProjectEntity).findOne({
            select: ['environment'],
            where: {
                _id: account.projectId,
            },
        });

        if (!project) {
            throw new BadRequestException('project does not exist');
        }

        const token = await generateToken(
            project.environment,
            account.environment
        ).catch((error: Error) => {
            throw new BadRequestException(error.message);
        });

        const { pathname, search } = new URL(issue.url);
        const response = await axios({
            url: pathname + search,
            baseURL: project.environment.host,
            method: issue.method,
            data: JSON.parse(issue.postData.toString()),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).catch((error: Error) => {
            throw new BadRequestException(error.message);
        });
        const content = JSON.parse(issue.content.toString());

        const allMatched = every(issue.fields, field => {
            return get(response.data, field) === get(content, field);
        });

        return {
            success: allMatched,
        };
    }
}
