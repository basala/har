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
    Button,
    ButtonGroup,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcAndroidOs, FcEditImage, FcFullTrash } from 'react-icons/fc';
import { createActionButton } from '../../Account/issue/IssueItem';
import RobotModal, { RobotParams } from './RobotModal';

interface RobotItemProps extends RobotParams {
    id: string;
    updateAt: number;
}

interface UpdateRobotInput extends RobotParams {
    id: string;
}

const UPDATE_ROBOT = gql`
    mutation updateRobot($input: UpdateRobotInput!) {
        updateRobot(input: $input) {
            id
            name
            webhook
            mentioned_list
        }
    }
`;
const DELETE_ROBOT = gql`
    mutation deleteRobot($id: String!) {
        deleteRobot(id: $id) {
            id
        }
    }
`;

const RobotItem: FC<RobotItemProps> = props => {
    const bg = useColorModeValue(
        '#fff linear-gradient( 135deg, rgba(250, 215, 161, 0.3) 10%, rgba(233, 109, 133, 0.3) 100%);',
        '#1a212c'
    );

    const { id, name, webhook, mentioned_list } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();
    const cancelRef = React.useRef(null);

    const [updateRobot, { loading: updateLoading }] = useMutation<
        {
            updateRobot: {
                id: string;
                name: string;
                webhook: string;
                mentioned_list: string[];
            };
        },
        {
            input: UpdateRobotInput;
        }
    >(UPDATE_ROBOT);
    const [deleteRobot, { loading: deleteLoading }] = useMutation<
        {
            deleteRobot: {
                id: string;
            };
        },
        {
            id: string;
        }
    >(DELETE_ROBOT, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllRobots(
                        existingRobots: Reference[] = [],
                        { readField }
                    ) {
                        const deleteRobotRef = cache.writeFragment({
                            data: data.data?.deleteRobot,
                            fragment: gql`
                                fragment Account on AccountEntity {
                                    id
                                }
                            `,
                        });
                        return existingRobots.filter(robot => {
                            return (
                                readField('id', deleteRobotRef) !==
                                readField('id', robot)
                            );
                        });
                    },
                },
            });
        },
    });

    const toast = useToast();
    const onUpdate = async (input: RobotParams) => {
        if (_.isEqual({ name, webhook, mentioned_list }, input)) {
            onClose();
        } else {
            const response = await updateRobot({
                variables: {
                    input: {
                        ...input,
                        id,
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
        const response = await deleteRobot({
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

    return (
        <HStack
            px={4}
            py={2}
            spacing={2}
            borderWidth={1}
            boxShadow="md"
            borderRadius="2rem"
            bg={bg}
        >
            <Icon as={FcAndroidOs} fontSize={25} w="3rem" />
            <Text
                w="1rem"
                flex="1"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                fontWeight="bold"
            >
                {props.name}
            </Text>
            <Badge colorScheme="linkedin">
                {new Date(props.updateAt).toLocaleString()}
            </Badge>
            <ButtonGroup>
                {createActionButton(<FcEditImage />, '编辑', onOpen)}
                {createActionButton(<FcFullTrash />, '删除', onDeleteTipOpen)}
                <RobotModal
                    header="更新配置"
                    isOpen={isOpen}
                    loading={updateLoading}
                    onClose={onClose}
                    onConfirm={onUpdate}
                    value={{ name, webhook, mentioned_list }}
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
                        <AlertDialogBody>{`删除后无法恢复噢，确定删除吗`}</AlertDialogBody>
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

export default RobotItem;
