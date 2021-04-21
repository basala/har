import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TypeormService } from './config';
import { AccountResolver } from './resolver/account.resolver';
import { AuthResolver } from './resolver/auth.resolver';
import { ProjectResolver } from './resolver/project.resolver';
import { UserResolver } from './resolver/user.resolver';

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
    providers: [ProjectResolver, UserResolver, AuthResolver, AccountResolver],
})
export class AppModule {}
