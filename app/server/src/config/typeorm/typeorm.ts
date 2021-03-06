import { TYPEORM } from '@environment';
import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { createConnection, getMetadataArgsStorage } from 'typeorm';
import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
    async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
        const options: MongoConnectionOptions = {
            ...TYPEORM,
            type: 'mongodb',
            entities: getMetadataArgsStorage().tables.map(tbl => tbl.target),

            synchronize: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            logging: true,
        };

        Logger.log(options, 'TYPEORM', false);

        createConnection(options)
            .then(() => {
                Logger.log(`Database connected`, 'TypeORM', false);
            })
            .catch(() => {
                Logger.error(`Database connect error`, '', 'TypeORM', false);
            });

        return options;
    }
}
