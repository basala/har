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
import _ from 'lodash';
import React, { FC } from 'react';
import { FcFile, FcFolder, FcPlus } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import { RoutePath, useUrlPath } from '../../../../hooks/url';
import AccountViewer from './AccountViewer';
import AccountModal, { AccountParams } from './modal/AccountModal';
import IssueUploadModal, { HarResult } from './modal/IssueUploadModal';

function parseInputId(storeFieldName: string) {
    return storeFieldName.match(/"input":"(.*)"/)?.[1];
}

const ADD_ACCOUNT = gql`
    mutation createAccount($input: CreateAccountInput!) {
        createAccount(input: $input) {
            id
        }
    }
`;

const ADD_ISSUES = gql`
    mutation createIssues($hars: [CreateIssuesInput!]!, $position: String!) {
        createIssues(hars: $hars, position: $position) {
            id
            accountId
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
                    findAllAccounts(existingAccounts = [], { storeFieldName }) {
                        const storeProjectId = parseInputId(storeFieldName);

                        if (_.trim(storeProjectId) === projectId) {
                            const newProjectRef = cache.writeFragment({
                                data: data.data?.createAccount,
                                fragment: gql`
                                    fragment NewAccount on AccountEntity {
                                        id
                                    }
                                `,
                            });
                            return [...existingAccounts, newProjectRef];
                        }

                        return existingAccounts;
                    },
                },
            });
        },
    });
    const [createIssues, { loading: createIssuesLoading }] = useMutation<
        {
            createIssues: {
                id: string;
                accountId: string;
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
                    findAllIssues(existingIssues = [], { storeFieldName }) {
                        const storeAccountId = parseInputId(storeFieldName);
                        const accountId = _.first(data.data?.createIssues)
                            ?.accountId;

                        if (storeAccountId === accountId) {
                            const newIssueRefs = _.map(
                                data.data?.createIssues,
                                issue => {
                                    return cache.writeFragment({
                                        data: issue,
                                        fragment: gql`
                                            fragment newIssue on IssueEntity {
                                                id
                                            }
                                        `,
                                    });
                                }
                            );
                            return [...existingIssues, ...newIssueRefs];
                        }

                        return existingIssues;
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
            toast({
                description: '上传成功!',
                position: 'top',
                status: 'success',
            });
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
