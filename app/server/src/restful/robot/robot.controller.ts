import { RestAuthGuard } from '@auth';
import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { TestConnectionDto } from './robot.dto';
import { RobotService } from './robot.service';

@Controller('robot')
@UsePipes(ValidationPipe)
@UseGuards(RestAuthGuard)
export class RobotController {
    constructor(private readonly robotService: RobotService) {}

    @Post('connection')
    async testConnection(
        @Body() connection: TestConnectionDto
    ): Promise<{
        valid: boolean;
    }> {
        const { webhook, mentioned_list } = connection;

        await this.robotService
            .sendTextMsg(webhook, mentioned_list)
            .catch(error => {
                throw new BadRequestException(error.message);
            });

        return {
            valid: true,
        };
    }
}
