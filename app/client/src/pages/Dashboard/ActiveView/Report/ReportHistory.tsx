import { gql, useMutation, useQuery } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcFullTrash, FcHighPriority } from 'react-icons/fc';
import EmptyPane from '../../../../components/Exception/EmptyPane';
import CatLoading from '../../../../components/Loading/CatLoading';
import ReportHistoryItem from './ReportHistoryItem';

const QUERY_REPORTS = gql`
    query findAllReports {
        findAllReports {
            id
            updateAt
        }
    }
`;

const DELETE_REPORTS = gql`
    mutation deleteReports {
        deleteReports {
            id
        }
    }
`;

const ReportHistory: FC = () => {
    const { loading, data, error } = useQuery<{
        findAllReports: {
            id: string;
            updateAt: number;
        }[];
    }>(QUERY_REPORTS, {
        fetchPolicy: 'cache-and-network',
    });
    const [deleteReports, { loading: deleteLoading }] = useMutation<{
        deleteReports: {
            id: string;
        }[];
    }>(DELETE_REPORTS, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllReports() {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const deleteReportRefs = _.map(
                            data.data?.deleteReports,
                            report => {
                                return cache.writeFragment({
                                    data: report,
                                    fragment: gql`
                                        fragment Report on ReportEntity {
                                            id
                                        }
                                    `,
                                });
                            }
                        );
                        return [];
                    },
                },
            });
        },
    });
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();

    const toast = useToast();
    const onDeleteReports = async () => {
        const response = await deleteReports().catch(errors => {
            return {
                data: null,
                errors: errors,
            };
        });

        if (response.errors) {
            toast({
                description: '删除失败',
                status: 'error',
                position: 'top',
            });
        } else {
            onDeleteTipClose();
            toast({
                description: '删除成功',
                status: 'success',
                position: 'top',
            });
        }
    };

    if (loading) {
        return <CatLoading />;
    }

    if (error) {
        return (
            <EmptyPane
                icon={FcHighPriority}
                text="哎呀好像出错了呢Σ( ° △ °|||)︴"
            />
        );
    }

    if (_.isEmpty(data?.findAllReports)) {
        return <EmptyPane icon={FcExpired} text="空空如也噢ヽ(✿ﾟ▽ﾟ)ノ" />;
    }

    return (
        <Flex direction="column" h="100%">
            <HStack h="4rem" justify="space-between">
                <Text fontSize={16} fontWeight="bold">
                    历史执行记录
                </Text>
                <Box>
                    <Button
                        colorScheme="pink"
                        leftIcon={<Icon as={FcFullTrash} boxSize={6} />}
                        ml="1rem"
                        onClick={onDeleteTipOpen}
                    >
                        删除全部
                    </Button>
                    <AlertDialog
                        leastDestructiveRef={undefined}
                        onClose={onDeleteTipClose}
                        isOpen={isDeleteTipOpen}
                    >
                        <AlertDialogOverlay />
                        <AlertDialogContent>
                            <AlertDialogHeader>w(ﾟДﾟ)w</AlertDialogHeader>
                            <AlertDialogCloseButton />
                            <AlertDialogBody>
                                {`将会删除该账号下所有历史执行记录, 且无法找回,确认删除吗?`}
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button onClick={onDeleteTipClose}>取消</Button>
                                <Button
                                    colorScheme="red"
                                    ml={3}
                                    onClick={onDeleteReports}
                                    isLoading={deleteLoading}
                                >
                                    确认
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Box>
            </HStack>
            <Divider />
            <Box flex="1" overflow="auto" my={4}>
                <VStack spacing={4} align="stretch">
                    {_.map(data?.findAllReports, report => {
                        return (
                            <ReportHistoryItem
                                key={report.id}
                                report={report}
                            />
                        );
                    })}
                </VStack>
            </Box>
        </Flex>
    );
};

export default ReportHistory;
