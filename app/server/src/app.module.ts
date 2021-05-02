import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TypeormService } from './config';
import { AccountResolver } from './resolver/account.resolver';
import { AuthResolver } from './resolver/auth.resolver';
import { IssueResolver } from './resolver/issue.resolver';
import { ProjectResolver } from './resolver/project.resolver';
import { ReportResolver } from './resolver/report.resolver';
import { RobotResolver } from './resolver/robot.resolver';
import { UserResolver } from './resolver/user.resolver';
import { AccountModule } from './restful/account/account.module';
import { ExecutionModule } from './restful/execution/execution.module';
import { RobotModule } from './restful/robot/robot.module';

@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: 'schema.gql',
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeormService,
        }),
        AccountModule,
        ExecutionModule,
        RobotModule,
    ],
    controllers: [AppController],
    providers: [
        ProjectResolver,
        UserResolver,
        AuthResolver,
        AccountResolver,
        IssueResolver,
        RobotResolver,
        ReportResolver,
    ],
})
export class AppModule {}
