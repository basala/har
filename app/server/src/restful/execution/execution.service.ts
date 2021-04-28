import { Injectable } from '@nestjs/common';

@Injectable()
export class ExecutionService {
    async executeProject(id: string) {
        return 'project' + id;
    }

    async executeAccount(id: string) {
        return 'account' + id;
    }

    async executeIssue(id: string) {
        return 'issue' + id;
    }
}
