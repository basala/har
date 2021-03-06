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
    Badge,
    Box,
    Button,
    ButtonGroup,
    Icon,
    useColorModeValue,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';
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
    const { id, name, environment, robot } = props;
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
                name: string;
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
    const onUpdate = async (name: string, environment: AccountParams) => {
        if (
            _.isEqual(
                _.pick(props.environment, _.keys(environment)),
                environment
            ) &&
            name === props.name
        ) {
            onClose();
        } else {
            const response = await updateAccount({
                variables: {
                    input: {
                        id,
                        name,
                        environment: environment,
                    },
                },
            }).catch(errors => {
                return {
                    errors,
                };
            });

            if (response.errors) {
                toast({
                    description: '????????????',
                    status: 'error',
                    position: 'top',
                });
            } else {
                onClose();
                toast({
                    description: '????????????',
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
                description: '????????????',
                status: 'error',
                position: 'top',
            });
        } else {
            onDeleteTipClose();
            toast({
                description: '????????????',
                status: 'success',
                position: 'top',
            });
        }
    };

    const [executeLoading, setExecuteLoading] = React.useState(false);
    const executeAccount = async () => {
        setExecuteLoading(true);

        const response = await axios
            .post<ExecutionResult[]>(`${RemoteUrl}/execute/${id}`, {
                type: 2,
                robot,
            })
            .catch(error => {
                console.log(error);
                toast({
                    description: '????????????',
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
                                // TODO spiner????????????
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
                                <Badge>{props.environment.username}</Badge>
                                <ButtonGroup
                                    onClick={event => {
                                        event.preventDefault();
                                    }}
                                    ml="1rem"
                                    mr="1rem"
                                >
                                    {createActionButton(
                                        <FcStart />,
                                        '??????',
                                        executeAccount,
                                        executeLoading
                                    )}
                                    {createActionButton(
                                        <FcEditImage />,
                                        '??????',
                                        onOpen
                                    )}
                                    {createActionButton(
                                        <FcFullTrash />,
                                        '??????',
                                        onDeleteTipOpen
                                    )}
                                    <AccountModal
                                        header="??????????????????"
                                        isOpen={isOpen}
                                        loading={updateLoading}
                                        onClose={onClose}
                                        onConfirm={onUpdate}
                                        name={name}
                                        environment={environment}
                                    />
                                    <AlertDialog
                                        leastDestructiveRef={cancelRef}
                                        onClose={onDeleteTipClose}
                                        isOpen={isDeleteTipOpen}
                                    >
                                        <AlertDialogOverlay />
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                w(????????)w
                                            </AlertDialogHeader>
                                            <AlertDialogCloseButton />
                                            <AlertDialogBody>
                                                {`????????????????????????????????????, ???????????????,???????????????${name}???????`}
                                            </AlertDialogBody>
                                            <AlertDialogFooter>
                                                <Button
                                                    ref={cancelRef}
                                                    onClick={onDeleteTipClose}
                                                >
                                                    ??????
                                                </Button>
                                                <Button
                                                    isLoading={deleteLoading}
                                                    colorScheme="red"
                                                    ml={3}
                                                    onClick={onDelete}
                                                >
                                                    ??????
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
