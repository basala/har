import { registerEnumType } from '@nestjs/graphql';

export enum RequestType {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

registerEnumType(RequestType, {
    name: 'RequestType',
    description: 'request type',
});

export enum RecordType {
    FOLDER,
    ISSUE,
}

registerEnumType(RecordType, {
    name: 'RecordType',
    description: 'record type',
});
