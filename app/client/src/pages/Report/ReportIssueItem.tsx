import {
    Badge,
    Box,
    Code,
    HStack,
    Icon,
    Link,
    Text,
    VStack,
} from '@chakra-ui/react';
import { Method } from 'axios';
import _ from 'lodash';
import React, { FC } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { FcCancel, FcOk } from 'react-icons/fc';

export interface ExecutionResult {
    success: boolean;
    data: {
        refer: any;
        actual: any;
        id: string;
        name: string;
        url: string;
        method: Method;
        accountName: string;
        projectName: string;
        host: string;
    };
    error?: string;
}

interface ReportIssueItemProps {
    issue: ExecutionResult;
}

const ReportIssueItem: FC<ReportIssueItemProps> = props => {
    const { issue } = props;
    const isPassed = issue.success;
    const isError = !_.isEmpty(issue.error);
    const [showDetail, setShowDetail] = React.useState(false);
    const { name, url, refer, actual, method } = issue.data;
    const { pathname, search } = new URL(url);

    return (
        <VStack
            align="stretch"
            spacing={2}
            borderWidth={1}
            boxShadow="md"
            borderRadius={8}
            bg={isPassed ? 'teal.50' : 'red.50'}
        >
            <HStack p={2} pl={4}>
                <Icon as={isPassed ? FcOk : FcCancel} fontSize={25} />
                <Box w="3rem">
                    <Badge colorScheme="pink">{method}</Badge>
                </Box>
                <Text
                    w="1rem"
                    flex="1"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    {name}
                </Text>
                <Code
                    px={2}
                    w="20rem"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    title={pathname + search}
                >
                    {pathname + search}
                </Code>
            </HStack>
            <Link
                color="blue.500"
                fontStyle="italic"
                fontWeight="bold"
                onClick={() => {
                    setShowDetail(!showDetail);
                }}
                pl="1rem"
                pb={showDetail ? 0 : 2}
                alignSelf="flex-start"
            >
                {showDetail ? '收起' : '展开详细...'}
            </Link>
            <Box hidden={!showDetail} pb="1rem">
                {isError ? (
                    <Text pl="1rem">{issue.error}</Text>
                ) : (
                    <ReactDiffViewer
                        oldValue={JSON.stringify(refer, null, 4)}
                        newValue={JSON.stringify(actual, null, 4)}
                        splitView={true}
                    />
                )}
            </Box>
        </VStack>
    );
};

export default ReportIssueItem;
