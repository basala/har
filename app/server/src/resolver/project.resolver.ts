import { TestEntity } from '@entity';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver('Project')
export class ProjectResolver {
    @Query(() => TestEntity)
    async project(@Args('id') id: string): Promise<any> {
        // try {
        //     return await getMongoRepository(ProjectEntity).findOne({
        //         select: ['_id', 'userId', 'name'],
        //         where: {
        //             _id: id,
        //         },
        //     });
        // } catch (error) {
        //     throw new ApolloError(error);
        // }
    }
}
