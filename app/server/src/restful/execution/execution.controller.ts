import {
    Body,
    Controller,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ExecutionDto, ExecutionType } from './execution.dto';
import { ExecutionService } from './execution.service';

@Controller('execute')
@UsePipes(ValidationPipe)
export class ExecutionController {
    constructor(private readonly executionService: ExecutionService) {}

    @Post(':id')
    async execute(@Param('id') id: string, @Body() config: ExecutionDto) {
        const { type, noticeId } = config;

        let response;
        switch (type) {
            case ExecutionType.Project:
                response = await this.executionService.executeProject(id);
                break;
            case ExecutionType.Account:
                response = await this.executionService.executeAccount(id);
                break;
            case ExecutionType.Issue:
                response = await this.executionService.executeIssue(id);
                break;
            default:
        }

        if (noticeId) {
            console.log(noticeId);
        }

        return {
            data: response,
        };
    }
}
