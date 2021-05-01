import { gql, useQuery } from '@apollo/client';
import { Box, Center, Spinner, VStack } from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcHighPriority } from 'react-icons/fc';
import EmptyPane from '../../../../../components/Exception/EmptyPane';
import IssueItem, { ExecutionResultMap, Issue } from './IssueItem';

interface IssueContainerProps {
    id: string;
    executionLists: ExecutionResultMap;
    setExecutionLists: React.Dispatch<React.SetStateAction<ExecutionResultMap>>;
}

const QUERY_ISSUE = gql`
    query account($input: String!) {
        findAllIssues(input: $input) {
            id
            name
            url
            method
        }
    }
`;

const IssueContainer: FC<IssueContainerProps> = props => {
    const { id } = props;
    const { loading, data, error } = useQuery<
        {
            findAllIssues: Issue[];
        },
        {
            input: string;
        }
    >(QUERY_ISSUE, {
        variables: {
            input: id,
        },
    });

    if (loading) {
        return (
            <Center h="10rem">
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="pink.200"
                />
                Waiting...
            </Center>
        );
    }

    if (error) {
        return (
            <Box h="10rem">
                <EmptyPane
                    icon={FcHighPriority}
                    text="哎呀好像出错了呢Σ( ° △ °|||)︴"
                    fontSize={14}
                    iconSize={20}
                />
            </Box>
        );
    }

    if (_.isEmpty(data?.findAllIssues)) {
        return (
            <Box h="10rem">
                <EmptyPane
                    icon={FcExpired}
                    fontSize={14}
                    iconSize={20}
                    text="貌似什么都没有噢ヽ(✿ﾟ▽ﾟ)ノ"
                />
            </Box>
        );
    }

    return (
        <VStack minH="10rem" align="stretch" spacing={4}>
            {_.map(data?.findAllIssues, (issue, index) => {
                return (
                    <Box key={issue.id} pl={4}>
                        <IssueItem
                            issue={issue}
                            executionLists={props.executionLists}
                            setExecutionLists={props.setExecutionLists}
                        />
                    </Box>
                );
            })}
        </VStack>
    );
};

export default IssueContainer;
