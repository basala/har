import { gql, useQuery } from '@apollo/client';
import {
    Box,
    HStack,
    Icon,
    IconButton,
    Stat,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { AiFillRocket } from 'react-icons/ai';
import {
    FcAbout,
    FcCancel,
    FcHighPriority,
    FcOk,
    FcSurvey,
} from 'react-icons/fc';
import EmptyPane from '../../components/Exception/EmptyPane';
import CatLoading from '../../components/Loading/CatLoading';
import { useUrlPath } from '../../hooks/url';
import ReportAccountItem from './ReportAccountItem';
import { ExecutionResult } from './ReportIssueItem';

const QUERY_REPORT = gql`
    query findReport($id: String!) {
        findReport(id: $id) {
            id
            report
            updateAt
        }
    }
`;

const ReportView: FC = () => {
    const [, reportId] = useUrlPath();
    const startRef = React.useRef<HTMLDivElement>(null);

    const { loading, data, error } = useQuery<
        {
            findReport: {
                id: string;
                report: ExecutionResult[];
                updateAt: Number;
            };
        },
        { id: string }
    >(QUERY_REPORT, {
        variables: {
            id: reportId,
        },
    });

    if (loading) {
        return (
            <Box h="100vh" w="100vw">
                <CatLoading size="xl" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box h="100vh" w="100vw">
                <EmptyPane
                    icon={FcHighPriority}
                    text="哎呀好像出错了呢Σ( ° △ °|||)︴"
                />
            </Box>
        );
    }

    let success = 0;
    let fail = 0;
    _.each(data?.findReport.report, record => {
        if (record.success) {
            success++;
        } else {
            fail++;
        }
    });
    const total = success + fail;
    const group = _.groupBy(data?.findReport.report, 'data.accountName');

    return (
        <>
            <div ref={startRef} />
            <Box h="100vh" w="100%" overflow="gray.50" p={4}>
                <VStack
                    position="relative"
                    borderWidth={1}
                    boxShadow="md"
                    bg="white"
                    borderRadius={8}
                    minH="100%"
                    alignItems="stretch"
                    p={4}
                    spacing={4}
                >
                    <IconButton
                        aria-label="go top"
                        boxSize="4rem"
                        fontSize={30}
                        icon={<AiFillRocket />}
                        position="fixed"
                        bottom="2rem"
                        right="1rem"
                        isRound
                        colorScheme="twitter"
                        onClick={() => {
                            startRef.current?.scrollIntoView({
                                behavior: 'smooth',
                            });
                        }}
                        zIndex="1"
                    />
                    <Box
                        h="8rem"
                        w="8rem"
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        overflow="hidden"
                        zIndex="1"
                    >
                        <Text
                            transform="rotate(45deg)"
                            textTransform="uppercase"
                            fontWeight="bold"
                            boxShadow="md"
                            w="10rem"
                            h="2rem"
                            lineHeight="2rem"
                            position="absolute"
                            top="1.5rem"
                            right="-2.5rem"
                            textAlign="center"
                            bg={fail > 0 ? 'red.400' : 'teal.400'}
                            color="white"
                        >
                            {fail > 0 ? 'FAIL' : 'SUCCESS'}
                        </Text>
                    </Box>
                    <HStack h="4rem">
                        <Icon h="100%" as={FcSurvey} fontSize={24} />
                        <Text fontWeight="bold" fontSize={24}>
                            执行结果
                        </Text>
                    </HStack>
                    <StatGroup
                        p={4}
                        borderWidth={1}
                        borderRadius={8}
                        boxShadow="sm"
                        textAlign="center"
                    >
                        <Stat>
                            <StatLabel fontSize={16}>Total</StatLabel>
                            <StatNumber fontSize={30}>{total}</StatNumber>
                            <StatHelpText>
                                <Icon as={FcAbout} fontSize={16} />
                            </StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize={16}>Success</StatLabel>
                            <StatNumber fontSize={30} color="teal">
                                {success}
                            </StatNumber>
                            <StatHelpText>
                                <Icon as={FcOk} fontSize={16} />
                            </StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize={16}>Fail</StatLabel>
                            <StatNumber fontSize={30} color="red">
                                {fail}
                            </StatNumber>
                            <StatHelpText>
                                <Icon as={FcCancel} fontSize={16} />
                            </StatHelpText>
                        </Stat>
                    </StatGroup>
                    {total > 0 ? (
                        <Box
                            p={4}
                            borderWidth={1}
                            borderRadius={8}
                            bg="blue.50"
                        >
                            <Text fontWeight="bold" fontSize={16}>
                                环境信息
                            </Text>
                            <Text mt="1rem" fontWeight="bold">
                                {`工程名: ${data?.findReport.report[0].data.projectName}`}
                            </Text>
                            <Text mt="1rem" fontWeight="bold">
                                {`工程地址: ${data?.findReport.report[0].data.host}`}
                            </Text>
                        </Box>
                    ) : (
                        <></>
                    )}
                    {total > 0 ? (
                        <Box p={4}>
                            <Text fontWeight="bold" fontSize={16}>
                                详细执行情况
                            </Text>
                            <VStack alignItems="stretch" mt="2rem" spacing={4}>
                                {_.map(_.keys(group), key => {
                                    return (
                                        <ReportAccountItem
                                            key={key}
                                            name={key}
                                            issues={group[key]}
                                        />
                                    );
                                })}
                            </VStack>
                        </Box>
                    ) : (
                        <></>
                    )}
                </VStack>
            </Box>
        </>
    );
};

export default ReportView;
