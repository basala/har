import { gql, Reference, useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Code,
    HStack,
    Icon,
    IconButton,
    Text,
    Tooltip,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import axios, { Method } from 'axios';
import React, { FC } from 'react';
import { FcEditImage, FcFullTrash, FcStart, FcVideoFile } from 'react-icons/fc';
import { RemoteUrl } from '../../../../../config/apollo';
import IssueModal from './IssueModal';

export function createActionButton(
    icon: React.ReactElement,
    label: string,
    onClick: () => void,
    loading = false
) {
    return (
        <IconButton
            icon={icon}
            aria-label={label}
            isRound
            isLoading={loading}
            fontSize={20}
            onClick={onClick}
        />
    );
}

export interface Issue {
    id: string;
    name: string;
    url: string;
    method: Method;
}

interface IssueItemProps {
    issue: Issue;
}

interface UpdateIssueInput {
    id: string;
    name: string;
}

const UPDATE_ISSUE = gql`
    mutation updateIssue($input: UpdateIssueInput!) {
        updateIssue(input: $input) {
            id
            name
        }
    }
`;
const DELETE_ISSUE = gql`
    mutation deleteIssue($id: String!) {
        deleteIssue(id: $id) {
            id
        }
    }
`;

const IssueItem: FC<IssueItemProps> = props => {
    const {
        issue: { name, url, method, id },
    } = props;
    const { pathname, search } = new URL(url);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();
    const cancelRef = React.useRef(null);

    const [updateIssue, { loading: updateLoading }] = useMutation<
        {
            updateIssue: {
                id: string;
                name: string;
            };
        },
        {
            input: UpdateIssueInput;
        }
    >(UPDATE_ISSUE);
    const [deleteIssue, { loading: deleteLoading }] = useMutation<
        {
            deleteIssue: {
                id: string;
            };
        },
        {
            id: string;
        }
    >(DELETE_ISSUE, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllIssues(
                        existingIssues: Reference[] = [],
                        { readField }
                    ) {
                        const deleteAccountRef = cache.writeFragment({
                            data: data.data?.deleteIssue,
                            fragment: gql`
                                fragment Account on AccountEntity {
                                    id
                                }
                            `,
                        });
                        return existingIssues.filter(account => {
                            return (
                                readField('id', deleteAccountRef) !==
                                readField('id', account)
                            );
                        });
                    },
                },
            });
        },
    });

    const toast = useToast();
    const onUpdate = async (newName: string) => {
        if (name === newName) {
            onClose();
        } else {
            const response = await updateIssue({
                variables: {
                    input: {
                        id,
                        name: newName,
                    },
                },
            }).catch(errors => {
                return {
                    errors,
                };
            });

            if (response.errors) {
                toast({
                    description: '更新失败',
                    status: 'error',
                    position: 'top',
                });
            } else {
                onClose();
                toast({
                    description: '更新成功',
                    status: 'success',
                    position: 'top',
                });
            }
        }
    };
    const onDelete = async () => {
        const response = await deleteIssue({
            variables: {
                id,
            },
        }).catch(errors => {
            return {
                errors,
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

    const [executeLoading, setExecuteLoading] = React.useState(false);
    const executeIssue = React.useCallback(async () => {
        setExecuteLoading(true);

        await axios
            .post<{
                valid: boolean;
            }>(`${RemoteUrl}/execute/${id}`, {
                type: 3,
            })
            .catch(error => {
                return {
                    data: {
                        valid: false,
                    },
                };
            });

        setExecuteLoading(false);
    }, [id]);

    return (
        <HStack
            p={2}
            pl={4}
            spacing={2}
            h="4rem"
            borderWidth={1}
            boxShadow="md"
            borderTopLeftRadius="4rem"
            borderBottomLeftRadius="4rem"
        >
            <Icon as={FcVideoFile} fontSize={25} />
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
            <Tooltip label={pathname + search} openDelay={500}>
                <Code
                    px={2}
                    w="20rem"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    {pathname + search}
                </Code>
            </Tooltip>
            <ButtonGroup w="10rem">
                {createActionButton(
                    <FcStart />,
                    '执行',
                    executeIssue,
                    executeLoading
                )}
                {createActionButton(<FcEditImage />, '编辑', onOpen)}
                {createActionButton(<FcFullTrash />, '删除', onDeleteTipOpen)}
                <IssueModal
                    isOpen={isOpen}
                    loading={updateLoading}
                    onClose={onClose}
                    onConfirm={onUpdate}
                    name={name}
                />
                <AlertDialog
                    leastDestructiveRef={cancelRef}
                    onClose={onDeleteTipClose}
                    isOpen={isDeleteTipOpen}
                >
                    <AlertDialogOverlay />
                    <AlertDialogContent>
                        <AlertDialogHeader>w(ﾟДﾟ)w</AlertDialogHeader>
                        <AlertDialogCloseButton />
                        <AlertDialogBody>{`删除后无法恢复噢，确定删除该用例吗`}</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteTipClose}>
                                取消
                            </Button>
                            <Button
                                isLoading={deleteLoading}
                                colorScheme="red"
                                ml={3}
                                onClick={onDelete}
                            >
                                确认
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </ButtonGroup>
        </HStack>
    );
};

export default IssueItem;
