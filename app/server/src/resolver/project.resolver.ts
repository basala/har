import { ProjectEntity } from '@entity';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { getMongoRepository } from 'typeorm';

@Resolver('Project')
export class ProjectResolver {
    @Query(() => ProjectEntity)
    async project(@Args('id') id: string): Promise<ProjectEntity> {
        try {
            return await getMongoRepository(ProjectEntity).findOne({
                select: ['_id', 'userId', 'name'],
                where: {
                    _id: id,
                },
            });
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}
