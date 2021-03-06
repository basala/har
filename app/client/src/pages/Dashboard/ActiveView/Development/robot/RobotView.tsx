import { gql, useMutation, useQuery } from '@apollo/client';
import { IconButton } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { Stack, VStack } from '@chakra-ui/layout';
import { useToast } from '@chakra-ui/toast';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcHighPriority, FcPlus } from 'react-icons/fc';
import EmptyPane from '../../../../../components/Exception/EmptyPane';
import CatLoading from '../../../../../components/Loading/CatLoading';
import {
    FindAllRobotsResponse,
    QUERY_ROBOTS,
} from '../../../../../query/robot';
import RobotItem from './RobotItem';
import RobotModal, { RobotParams } from './RobotModal';

const ADD_ROBOT = gql`
    mutation addRobot($input: CreateRobotInput!) {
        createRobot(input: $input) {
            id
        }
    }
`;

const RobotView: FC = () => {
    const { loading, data, error } = useQuery<FindAllRobotsResponse>(
        QUERY_ROBOTS
    );
    const [createRobot, { loading: addLoading }] = useMutation<
        {
            createRobot: {
                id: string;
            };
        },
        {
            input: RobotParams;
        }
    >(ADD_ROBOT, {
        update(cache, data) {
            cache.modify({
                fields: {
                    findAllRobots(existingRobots = []) {
                        const newProjectRef = cache.writeFragment({
                            data: data.data?.createRobot,
                            fragment: gql`
                                fragment NewRobot on RobotEntity {
                                    id
                                }
                            `,
                        });
                        return [...existingRobots, newProjectRef];
                    },
                },
            });
        },
    });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const onSave = async (input: RobotParams) => {
        const response = await createRobot({
            variables: {
                input,
            },
        }).catch(errors => {
            return {
                data: null,
                errors,
            };
        });

        if (response.data) {
            onClose();
        } else if (response.errors) {
            toast({
                description: '????????????',
                status: 'error',
                position: 'top',
            });
        }
    };

    const render = React.useCallback(() => {
        if (loading) {
            return <CatLoading size="lg" />;
        }

        if (error) {
            return (
                <EmptyPane
                    icon={FcHighPriority}
                    text="??????????????????????????( ?? ??? ??|||)???"
                />
            );
        }

        if (_.isEmpty(data?.findAllRobots)) {
            return <EmptyPane icon={FcExpired} text="??????????????????(????????????)???" />;
        }

        return _.map(data?.findAllRobots, robot => {
            const { id, name, webhook, mentioned_list, updateAt } = robot;

            return (
                <RobotItem
                    key={id}
                    id={id}
                    name={name}
                    webhook={webhook}
                    mentioned_list={mentioned_list}
                    updateAt={updateAt}
                />
            );
        });
    }, [data?.findAllRobots, error, loading]);

    return (
        <VStack align="stretch" h="100%">
            <Stack flex="1" py={1} overflow="auto" spacing={4}>
                {render()}
            </Stack>
            <IconButton
                icon={<FcPlus />}
                bg="rgb(76, 175, 80)"
                _hover={{ bg: 'rgb(76, 175, 80)' }}
                _active={{ bg: 'rgb(76, 175, 80)' }}
                fontSize={30}
                aria-label="add"
                isRound
                alignSelf="flex-end"
                onClick={onOpen}
            />
            <RobotModal
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={onSave}
                header="??????"
                loading={addLoading}
            />
        </VStack>
    );
};

export default RobotView;
