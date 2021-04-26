import { gql, useMutation } from '@apollo/client';
import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcFile, FcFolder, FcPlus } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { RoutePath, useUrlPath } from '../../../../hooks/url';
import AccountViewer from './AccountViewer';
import AccountModal, { AccountParams } from './modal/AccountModal';
import IssueUploadModal, { HarResult } from './modal/IssueUploadModal';

const ADD_ACCOUNT = gql`
    mutation createAccount($input: CreateAccountInput!) {
        createAccount(input: $input) {
            id
        }
    }
`;

const ADD_ISSUES = gql`
    mutation createAccounts($hars: [CreateIssuesInput!]!, $position: String!) {
        createIssues(hars: $hars, position: $position) {
            id
        }
    }
`;

export interface CreateAccountInput {
    projectId: string;
    name: string;
    environment: AccountParams;
}

const AccountContainer: FC = () => {
    const [, projectId] = useUrlPath();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isUploadOpen,
        onOpen: onUploadOpen,
        onClose: onUploadClose,
    } = useDisclosure();
    const [createAccount, { loading }] = useMutation<
        {
            createAccount: {
                id: string;
            };
        },
        {
            input: CreateAccountInput;
        }
    >(ADD_ACCOUNT, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllAccounts(existingAccounts = []) {
                        const newProjectRef = cache.writeFragment({
                            data: data.data?.createAccount,
                            fragment: gql`
                                fragment NewAccount on AccountEntity {
                                    id
                                }
                            `,
                        });
                        return [...existingAccounts, newProjectRef];
                    },
                },
            });
        },
    });
    const [createIssues, { loading: createIssuesLoading }] = useMutation<
        {
            createIssues: {
                id: string;
            }[];
        },
        {
            hars: Omit<HarResult, 'selected'>[];
            position: string;
        }
    >(ADD_ISSUES, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllIssues(existingIssues = []) {
                        const newIssueRefs = cache.writeFragment({
                            data: data.data?.createIssues,
                            fragment: gql`
                                fragment newIssue on IssueEntity {
                                    id
                                }
                            `,
                        });
                        return [...existingIssues, newIssueRefs];
                    },
                },
            });
        },
    });

    const [isAdding, setAdding] = React.useState(false);
    const toast = useToast();
    const onSave = async (input: AccountParams) => {
        if (!projectId) {
            toast({
                description: '由于不可预期的原因导致projectId为空, 添加失败',
                status: 'error',
                position: 'top',
            });
            return;
        }

        const response = await createAccount({
            variables: {
                input: {
                    environment: input,
                    name: input.username,
                    projectId: projectId,
                },
            },
        }).catch(errors => {
            return {
                data: null,
                errors,
            };
        });

        if (response.data) {
            onClose();
            setAdding(true);
        } else if (response.errors) {
            toast({
                description: '添加账号失败',
                status: 'error',
                position: 'top',
            });
        }
    };
    const onUpload = async ({
        hars,
        position,
    }: {
        hars: HarResult[];
        position: string;
    }) => {
        if (!projectId) {
            toast({
                description: '由于不可预期的原因导致projectId为空, 添加失败',
                status: 'error',
                position: 'top',
            });
            return;
        }

        const response = await createIssues({
            variables: {
                hars,
                position,
            },
        }).catch(errors => {
            return {
                data: null,
                errors,
            };
        });

        if (response.data) {
            onUploadClose();
        } else if (response.errors) {
            toast({
                description: '添加失败',
                status: 'error',
                position: 'top',
            });
        }
    };

    return (
        <Flex direction="column" h="100%">
            <HStack h="4rem" justify="space-between">
                <Breadcrumb fontWeight="bold" fontSize={16}>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to={`/${RoutePath.Project}`}>
                            所有项目
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>
                            {projectId.split('-')[0]}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
                <Box>
                    <Menu>
                        <MenuButton
                            as={Button}
                            colorScheme="pink"
                            leftIcon={<Icon as={FcPlus} boxSize={6} />}
                        >
                            添加...
                        </MenuButton>
                        <MenuList>
                            <MenuItem
                                icon={<Icon as={FcFolder} boxSize={6} />}
                                onClick={onOpen}
                            >
                                测试账号
                            </MenuItem>
                            <MenuItem
                                icon={<Icon as={FcFile} boxSize={6} />}
                                onClick={onUploadOpen}
                            >
                                Har用例
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
                <AccountModal
                    header="添加测试账号"
                    isOpen={isOpen}
                    onClose={onClose}
                    onConfirm={onSave}
                    loading={loading}
                />
                <IssueUploadModal
                    isOpen={isUploadOpen}
                    onClose={onUploadClose}
                    onConfirm={onUpload}
                    loading={createIssuesLoading}
                />
            </HStack>
            <Divider />
            <Box flex="1" overflow="auto" my={4}>
                <AccountViewer isAdding={isAdding} setAdding={setAdding} />
            </Box>
        </Flex>
    );
};

export default AccountContainer;
