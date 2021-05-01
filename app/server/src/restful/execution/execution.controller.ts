import { RestAuthGuard } from '@auth';
import {
    Body,
    Controller,
    Param,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ExecutionDto, ExecutionType } from './execution.dto';
import { ExecutionResponse, ExecutionService } from './execution.service';

@Controller('execute')
@UsePipes(ValidationPipe)
@UseGuards(RestAuthGuard)
export class ExecutionController {
    constructor(private readonly executionService: ExecutionService) {}

    @Post(':id')
    async execute(@Param('id') id: string, @Body() config: ExecutionDto) {
        const { type, noticeId } = config;

        let response: ExecutionResponse[];
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

        return response;
    }
}
