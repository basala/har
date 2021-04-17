import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TypeormService } from './config';
import { ProjectResolver } from './resolver/project.resolver';

@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: 'schema.gql',
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeormService,
        }),
    ],
    controllers: [AppController],
    providers: [ProjectResolver],
})
export class AppModule {}
