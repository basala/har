import { RestAuthGuard } from '@auth';
import { ReportEntity } from '@entity';
import {
    Body,
    Controller,
    Param,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { each, map } from 'lodash';
import { getMongoRepository } from 'typeorm';
import { RobotService } from '../robot/robot.service';
import { ExecutionDto, ExecutionType } from './execution.dto';
import { ExecutionResponse, ExecutionService } from './execution.service';

@Controller('execute')
@UsePipes(ValidationPipe)
@UseGuards(RestAuthGuard)
export class ExecutionController {
    constructor(
        private readonly executionService: ExecutionService,
        private readonly robotService: RobotService
    ) {}

    @Post(':id')
    async execute(
        @Param('id') id: string,
        @Body() config: ExecutionDto,
        @Req() request: Request
    ) {
        const { type, robot } = config;

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

        if (robot) {
            // 不需要await
            new Promise<void>(resolve => {
                resolve();
            }).then(async () => {
                const createReport = await getMongoRepository(
                    ReportEntity
                ).save(
                    new ReportEntity({
                        content: map(response, item => {
                            return Buffer.from(JSON.stringify(item), 'utf-8');
                        }),
                    })
                );
                let success = 0;
                let fail = 0;

                each(response, value => {
                    if (value.success) {
                        success++;
                    } else {
                        fail++;
                    }
                });

                const url =
                    request.headers.referer + 'report/s/' + createReport.id;
                this.robotService.sendMsgById(
                    robot,
                    'markdown',
                    `## Har自动化测试执行结果\n本次共执行用例<font color="blue">${
                        success + fail
                    }</font>条\n>成功: <font color="green">${success}</font>条\n>失败: <font color="red">${fail}</font>条 \n\n详细信息请查看: [${url}](${url})`
                );
            });
        }

        return response;
    }
}
