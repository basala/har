import { gql, Reference, useMutation } from '@apollo/client';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Center,
    Flex,
    Icon,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcPackage, FcSettings } from 'react-icons/fc';
import { Link as RouterLink } from 'react-router-dom';
import ProjectModal, { ProjectParams } from './ProjectModal';

interface ProjectItemProps extends ProjectParams {
    id: string;
}

const UPDATE_PROJECT = gql`
    mutation updateProject($input: UpdateProjectInput!) {
        updateProject(input: $input) {
            id
            name
            environment {
                host
                authUrl
                authBody
                tokenPath
            }
        }
    }
`;

const DELETE_PROJECT = gql`
    mutation deleteProject($id: String!) {
        deleteProject(id: $id) {
            id
        }
    }
`;

const ProjectItem: FC<ProjectItemProps> = props => {
    const { name, id, environment } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();
    const [updateProject, { loading: updateLoading }] = useMutation<
        {
            updateProject: {
                id: string;
            };
        },
        {
            input: {
                id: string;
            } & ProjectParams;
        }
    >(UPDATE_PROJECT);
    const [deleteProject, { loading: deleteLoading }] = useMutation<
        {
            deleteProject: {
                id: string;
            };
        },
        {
            id: string;
        }
    >(DELETE_PROJECT, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllProjects(existingProjects: Reference[] = []) {
                        const newProjectRef = cache.writeFragment({
                            data: data.data?.deleteProject,
                            fragment: gql`
                                fragment Project on ProjectEntity {
                                    id
                                }
                            `,
                        });
                        return existingProjects.filter(project => {
                            return project.__ref !== newProjectRef?.__ref;
                        });
                    },
                },
            });
        },
    });
    const toast = useToast();

    const onUpdate = async (input: ProjectParams) => {
        if (
            _.isEqual(
                _.pick(environment, _.keys(input.environment)),
                input.environment
            ) &&
            name === input.name
        ) {
            onClose();
        } else {
            const response = await updateProject({
                variables: {
                    input: {
                        id,
                        ...input,
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
        const response = await deleteProject({
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

    return (
        <Stack
            h="10rem"
            borderWidth={1}
            borderRadius={8}
            shadow="sm"
            _hover={{ shadow: 'md' }}
            spacing={0}
        >
            <Box h="8rem">
                <Link
                    as={RouterLink}
                    to={`/project/${id}`}
                    style={{ textDecoration: 'none' }}
                    _focus={{
                        border: '0',
                    }}
                    _active={{
                        border: '0',
                    }}
                >
                    <Flex direction="column" p="1rem" pb="2rem">
                        <Tooltip label={name} placement="auto-start">
                            <Text
                                h="2rem"
                                fontWeight="bold"
                                color={useColorModeValue('teal.500', 'light')}
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                            >
                                {name}
                            </Text>
                        </Tooltip>
                        <Center flex="1">
                            <Icon as={FcPackage} boxSize={20} />
                        </Center>
                    </Flex>
                </Link>
            </Box>
            <Menu placement="right-start" autoSelect={false}>
                <MenuButton
                    h="4rem"
                    as={IconButton}
                    icon={<FcSettings />}
                    alignSelf="flex-end"
                    aria-label="settings"
                    variant="ghost"
                    _focus={{
                        border: '0',
                        bg: '',
                    }}
                    _hover={{
                        bg: '',
                    }}
                    _active={{ bg: '' }}
                ></MenuButton>
                <MenuList>
                    <MenuItem icon={<EditIcon />} onClick={onOpen}>
                        配置
                    </MenuItem>
                    <MenuItem icon={<DeleteIcon />} onClick={onDeleteTipOpen}>
                        删除
                    </MenuItem>
                </MenuList>
            </Menu>
            <ProjectModal
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={onUpdate}
                header={name}
                loading={updateLoading}
                loadingText="Updating..."
                value={props}
            />
            <Modal isOpen={isDeleteTipOpen} onClose={onDeleteTipClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>w(ﾟДﾟ)w</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {`将会删除改工程下所有账号以及har用例信息, 且无法找回,
                        确认删除 ${name} 吗?`}
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={onDeleteTipClose}>
                            取消
                        </Button>
                        <Button
                            isLoading={deleteLoading}
                            colorScheme="blue"
                            onClick={onDelete}
                        >
                            确认
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Stack>
    );
};

export default ProjectItem;
