import { registerEnumType } from '@nestjs/graphql';

export enum RequestType {
    Post = 'POST',
    Get = 'GET',
    Put = 'PUT',
    Delete = 'DELETE',
}

registerEnumType(RequestType, {
    name: 'RequestType',
    description: 'request type',
});
