import { gql, useQuery } from '@apollo/client';
import { SimpleGrid } from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcHighPriority } from 'react-icons/fc';
import EmptyPane from '../../../../components/Exception/EmptyPane';
import CatLoading from '../../../../components/Loading/CatLoading';
import { ProjectParams } from './modal/ProjectModal';
import ProjectItem from './ProjectItem';

const QUERY_PROJECT = gql`
    query project {
        findAllProjects {
            name
            id
            updateAt
            environment {
                host
                authUrl
                authBody
                tokenPath
            }
        }
    }
`;

const ProjectViewer: FC = () => {
    const { loading, error, data } = useQuery<{
        findAllProjects: ({
            id: string;
        } & ProjectParams)[];
    }>(QUERY_PROJECT);

    if (loading) {
        return <CatLoading size="lg" />;
    }

    if (error) {
        return (
            <EmptyPane
                icon={FcHighPriority}
                text="哎呀好像出错了呢Σ( ° △ °|||)︴"
            />
        );
    }

    if (_.isEmpty(data?.findAllProjects)) {
        return <EmptyPane icon={FcExpired} text="貌似什么都没有噢ヽ(✿ﾟ▽ﾟ)ノ" />;
    }

    return (
        <SimpleGrid columns={5} spacing={6}>
            {_.map(
                _.orderBy(data?.findAllProjects, 'updateAt', 'desc'),
                (project, index) => {
                    return <ProjectItem key={index} {...project} />;
                }
            )}
        </SimpleGrid>
    );
};

export default ProjectViewer;
