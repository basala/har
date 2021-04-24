import { gql, Reference, useMutation } from '@apollo/client';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
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
    Center,
    Flex,
    Icon,
    IconButton,
    LinkBox,
    LinkOverlay,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcBookmark, FcPackage, FcSettings } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import ProjectModal, { ProjectParams } from './modal/ProjectModal';

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
    const cancelRef = React.useRef(null);
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
            <LinkBox h="100%">
                <Box position="absolute" inset="0">
                    <Tooltip label={name} placement="auto-start">
                        <LinkOverlay
                            as={Link}
                            to={`/project/${id}`}
                        ></LinkOverlay>
                    </Tooltip>
                    <Icon
                        as={FcBookmark}
                        position="absolute"
                        right="0"
                        top="-5px"
                        boxSize={10}
                    />
                    <Flex direction="column" h="100%">
                        <Text
                            h="2rem"
                            mx="1rem"
                            mt="1rem"
                            fontWeight="bold"
                            color={useColorModeValue('teal.500', 'light')}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                        >
                            {name}
                        </Text>
                        <Center flex="1">
                            <Icon as={FcPackage} boxSize={20} />
                        </Center>
                        <Menu placement="right-start" autoSelect={false}>
                            <MenuButton
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
                                <ProjectModal
                                    isOpen={isOpen}
                                    onClose={onClose}
                                    onConfirm={onUpdate}
                                    header={name}
                                    loading={updateLoading}
                                    loadingText="Updating..."
                                    value={props}
                                />
                                <MenuItem
                                    icon={<DeleteIcon />}
                                    onClick={onDeleteTipOpen}
                                >
                                    删除
                                </MenuItem>
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
                                            {`将会删除改工程下所有账号以及用例, 且无法找回,
                        确认删除 ${name} 吗?`}
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
                            </MenuList>
                        </Menu>
                    </Flex>
                </Box>
            </LinkBox>
        </Stack>
    );
};

export default ProjectItem;
