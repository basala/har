import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeormService } from './config';

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
    providers: [AppService],
})
export class AppModule {}
