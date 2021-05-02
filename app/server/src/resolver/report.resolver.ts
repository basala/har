import { FormatReport, ReportEntity } from '@entity';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { getMongoRepository } from 'typeorm';

@Resolver('Report')
export class ReportResolver {
    @Query(() => FormatReport)
    async findReport(@Args('id') id: string): Promise<FormatReport> {
        const report = await getMongoRepository(ReportEntity).findOne({
            _id: id,
        });

        if (!report) {
            throw new ForbiddenError('report not found.');
        }

        return new FormatReport(report);
    }
}
