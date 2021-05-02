import { gql, Reference, useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    HStack,
    Icon,
    IconButton,
    LinkBox,
    LinkOverlay,
    Text,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcFullTrash, FcSurvey } from 'react-icons/fc';
import { RoutePath } from '../../../../hooks/url';

interface ReportHistoryItemProps {
    report: {
        id: string;
        updateAt: number;
    };
}

const DELETE_REPORT = gql`
    mutation deleteReport($id: String!) {
        deleteReport(id: $id) {
            id
        }
    }
`;

const ReportHistoryItem: FC<ReportHistoryItemProps> = props => {
    const { report } = props;
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();

    const [deleteReport, { loading: deleteLoading }] = useMutation<
        {
            deleteReport: {
                id: string;
            };
        },
        {
            id: string;
        }
    >(DELETE_REPORT, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllReports(
                        existingReports: Reference[] = [],
                        { readField }
                    ) {
                        const deleteReportRef = cache.writeFragment({
                            data: data.data?.deleteReport,
                            fragment: gql`
                                fragment Report on ReportEntity {
                                    id
                                }
                            `,
                        });
                        return existingReports.filter(report => {
                            return (
                                readField('id', report) !==
                                readField('id', deleteReportRef)
                            );
                        });
                    },
                },
            });
        },
    });

    const toast = useToast();
    const onDeleteReport = async (id: string) => {
        const response = await deleteReport({
            variables: {
                id,
            },
        }).catch(errors => {
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
            // onDeleteTipClose();
            toast({
                description: '删除成功',
                status: 'success',
                position: 'top',
            });
        }
    };

    return (
        <LinkBox bg="blue.50" key={report.id}>
            <LinkOverlay
                href={`/${RoutePath.Report}/s/${report.id}`}
                target="_blank"
            />
            <HStack
                h="4rem"
                borderWidth={1}
                borderRadius={4}
                boxShadow="md"
                px={4}
            >
                <Icon w="2rem" fontSize={20} as={FcSurvey} />
                <Text flex="1" fontWeight="bold">
                    {new Date(report.updateAt).toLocaleString()}
                </Text>
                <IconButton
                    aria-label="remove"
                    fontSize={20}
                    icon={<FcFullTrash />}
                    onClick={onDeleteTipOpen}
                />
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
                            {`将会删除该条记录, 且无法找回,确认删除吗?`}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onDeleteTipClose}>取消</Button>
                            <Button
                                colorScheme="red"
                                ml={3}
                                onClick={() => {
                                    onDeleteReport(report.id);
                                }}
                                isLoading={deleteLoading}
                            >
                                确认
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </HStack>
        </LinkBox>
    );
};

export default ReportHistoryItem;
