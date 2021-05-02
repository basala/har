import { CurrentUser, GQLAuthGuard } from '@auth';
import { FormatReport, ReportEntity, UserEntity } from '@entity';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { isEmpty, map } from 'lodash';
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

    @Query(() => [FormatReport])
    @UseGuards(GQLAuthGuard)
    async findAllReports(
        @CurrentUser() user: UserEntity
    ): Promise<FormatReport[]> {
        const reports = await getMongoRepository(ReportEntity).find({
            userId: user.id,
            order: {
                updateAt: 'DESC',
            },
        });

        return map(reports, report => {
            return new FormatReport(report);
        });
    }

    @Mutation(() => ReportEntity)
    @UseGuards(GQLAuthGuard)
    async deleteReport(
        @Args('id') id: string,
        @CurrentUser() user: UserEntity
    ): Promise<ReportEntity> {
        const report = await getMongoRepository(ReportEntity).findOne({
            _id: id,
            userId: user.id,
        });

        if (!report) {
            throw new ForbiddenException('report does not exist');
        }

        await getMongoRepository(ReportEntity).delete({
            _id: id,
        });

        return report;
    }

    @Mutation(() => [ReportEntity])
    @UseGuards(GQLAuthGuard)
    async deleteReports(
        @CurrentUser() user: UserEntity
    ): Promise<ReportEntity[]> {
        const reports = await getMongoRepository(ReportEntity).find({
            userId: user.id,
        });

        if (isEmpty(reports)) {
            throw new ForbiddenException('already empty');
        }

        await getMongoRepository(ReportEntity).deleteMany({
            userId: user.id,
        });

        return reports;
    }
}
