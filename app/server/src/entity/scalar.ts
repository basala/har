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
