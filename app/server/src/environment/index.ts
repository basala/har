import { config } from 'dotenv';

config({
    path: process.env.DOTENV_CONFIG_PATH || '.env',
});

// mongodb
const MONGO_HOST = process.env.MONGO_HOST || '';
const MONGO_PORT: number = +process.env.MONGO_PORT || 27017;
const MONGO_DB: string = process.env.MONGO_DATABASE;
const MONGO_USER: string = process.env.MONGO_USER;
const MONGO_PASSWD: string = process.env.MONGO_PASSWD;
const MONGO_REPLICASET: string = process.env.MONGO_REPLICASET;
const MONGO_AUTHSOURCE: string = process.env.MONGO_AUTHSOURCE;

// typeorm
export const TYPEORM = {
    host: MONGO_HOST,
    port: MONGO_PORT,
    username: MONGO_USER,
    password: MONGO_PASSWD,
    database: MONGO_DB,
    replicaSet: MONGO_REPLICASET,
    authSource: MONGO_AUTHSOURCE,
};
