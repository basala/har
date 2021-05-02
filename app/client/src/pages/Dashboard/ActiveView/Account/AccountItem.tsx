import { gql, Reference, useMutation } from '@apollo/client';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    ButtonGroup,
    Icon,
    useColorModeValue,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import {
    FcEditImage,
    FcFolder,
    FcFullTrash,
    FcOpenedFolder,
    FcStart,
} from 'react-icons/fc';
import { RemoteUrl } from '../../../../config/apollo';
import { baseRequest } from '../../../../config/axios';
import IssueContainer from './issue/IssueContainer';
import {
    createActionButton,
    ExecutionResult,
    ExecutionResultMap,
} from './issue/IssueItem';
import AccountModal, { AccountParams } from './modal/AccountModal';

interface AccountItemProps {
    id: string;
    name: string;
    environment: AccountParams;
    executionLists: ExecutionResultMap;
    setExecutionLists: React.Dispatch<React.SetStateAction<ExecutionResultMap>>;
    robot: string;
}

const UPDATE_ACCOUNT = gql`
    mutation updateAccount($input: UpdateAccountInput!) {
        updateAccount(input: $input) {
            id
            name
            environment {
                username
                password
            }
        }
    }
`;
const DELETE_ACCOUNT = gql`
    mutation deleteAccount($id: String!) {
        deleteAccount(id: $id) {
            id
        }
    }
`;

const AccountItem: FC<AccountItemProps> = props => {
    const { id, name, environment } = props;
    const bg = useColorModeValue(
        '#fff linear-gradient( 135deg, rgba(250, 215, 161, 0.3) 10%, rgba(233, 109, 133, 0.3) 100%);',
        '#1a212c'
    );
    const cancelRef = React.useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();
    const [updateAccount, { loading: updateLoading }] = useMutation<
        {
            updateAccount: {
                id: string;
                name: string;
                environment: AccountParams;
            };
        },
        {
            input: {
                id: string;
                environment: AccountParams;
            };
        }
    >(UPDATE_ACCOUNT);
    const [deleteAccount, { loading: deleteLoading }] = useMutation<
        {
            deleteAccount: {
                id: string;
            };
        },
        {
            id: string;
        }
    >(DELETE_ACCOUNT, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllAccounts(
                        existingAccounts: Reference[] = [],
                        { readField }
                    ) {
                        const deleteAccountRef = cache.writeFragment({
                            data: data.data?.deleteAccount,
                            fragment: gql`
                                fragment Account on AccountEntity {
                                    id
                                }
                            `,
                        });
                        return existingAccounts.filter(account => {
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
    const onUpdate = async (input: AccountParams) => {
        if (_.isEqual(_.pick(environment, _.keys(input)), input)) {
            onClose();
        } else {
            const response = await updateAccount({
                variables: {
                    input: {
                        id,
                        environment: input,
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
        const response = await deleteAccount({
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
            onDeleteTipClose();
            toast({
                description: '删除成功',
                status: 'success',
                position: 'top',
            });
        }
    };

    const [executeLoading, setExecuteLoading] = React.useState(false);
    const executeAccount = async () => {
        setExecuteLoading(true);

        const response = await baseRequest
            .post<ExecutionResult[]>(`${RemoteUrl}/execute/${id}`, {
                type: 2,
            })
            .catch(error => {
                console.log(error);
                toast({
                    description: '执行失败',
                    position: 'top',
                    status: 'error',
                });
                return {
                    data: [],
                };
            });

        const map: ExecutionResultMap = {};
        _.each(response.data, res => {
            map[res.data.id] = res;
        });
        props.setExecutionLists({
            ...props.executionLists,
            ...map,
        });

        setExecuteLoading(false);
    };

    return (
        <Accordion allowToggle>
            <AccordionItem borderWidth={1} boxShadow="md">
                {({ isExpanded }) => {
                    return (
                        <>
                            <AccordionButton
                                as={Box}
                                cursor="pointer"
                                position="sticky"
                                top="0"
                                _hover={{
                                    bg: '',
                                }}
                                _focus={{
                                    border: '0',
                                }}
                                h="4rem"
                                bg={bg}
                                // TODO spiner覆盖问题
                                zIndex="1"
                            >
                                <Icon
                                    as={isExpanded ? FcOpenedFolder : FcFolder}
                                    boxSize={8}
                                    mr="1rem"
                                />
                                <Box
                                    flex="1"
                                    textAlign="left"
                                    fontWeight="bold"
                                >
                                    {props.name}
                                </Box>
                                <ButtonGroup
                                    onClick={event => {
                                        event.preventDefault();
                                    }}
                                    mr="1rem"
                                >
                                    {createActionButton(
                                        <FcStart />,
                                        '执行',
                                        executeAccount,
                                        executeLoading
                                    )}
                                    {createActionButton(
                                        <FcEditImage />,
                                        '编辑',
                                        onOpen
                                    )}
                                    {createActionButton(
                                        <FcFullTrash />,
                                        '删除',
                                        onDeleteTipOpen
                                    )}
                                    <AccountModal
                                        header="更新账号设置"
                                        isOpen={isOpen}
                                        loading={updateLoading}
                                        onClose={onClose}
                                        onConfirm={onUpdate}
                                        value={environment}
                                    />
                                    <AlertDialog
                                        leastDestructiveRef={cancelRef}
                                        onClose={onDeleteTipClose}
                                        isOpen={isDeleteTipOpen}
                                    >
                                        <AlertDialogOverlay />
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                w(ﾟДﾟ)w
                                            </AlertDialogHeader>
                                            <AlertDialogCloseButton />
                                            <AlertDialogBody>
                                                {`将会删除该账号下所有用例, 且无法找回,确认删除【${name}】吗?`}
                                            </AlertDialogBody>
                                            <AlertDialogFooter>
                                                <Button
                                                    ref={cancelRef}
                                                    onClick={onDeleteTipClose}
                                                >
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
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                {isExpanded ? (
                                    <IssueContainer
                                        id={id}
                                        executionLists={props.executionLists}
                                        setExecutionLists={
                                            props.setExecutionLists
                                        }
                                        robot={props.robot}
                                    />
                                ) : (
                                    <></>
                                )}
                            </AccordionPanel>
                        </>
                    );
                }}
            </AccordionItem>
        </Accordion>
    );
};

export default AccountItem;
