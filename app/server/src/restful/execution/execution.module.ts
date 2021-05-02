import { Module } from '@nestjs/common';
import { RobotModule } from '../robot/robot.module';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';

@Module({
    controllers: [ExecutionController],
    providers: [ExecutionService],
    imports: [RobotModule],
})
export class ExecutionModule {}
