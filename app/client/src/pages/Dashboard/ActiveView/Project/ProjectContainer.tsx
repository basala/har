import { gql, useMutation } from '@apollo/client';
import Icon from '@chakra-ui/icon';
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Text,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcPlus } from 'react-icons/fc';
import ProjectModal, { ProjectParams } from './ProjectModal';
import ProjectViewer from './ProjectViewer';

const ADD_PROJECT = gql`
    mutation project($input: CreateProjectInput!) {
        createProject(input: $input) {
            id
        }
    }
`;

const ProjectContainer: FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [addProject, { loading }] = useMutation<
        {
            createProject: {
                id: string;
            };
        },
        {
            input: ProjectParams;
        }
    >(ADD_PROJECT);
    const toast = useToast();

    const onSave = async (input: ProjectParams) => {
        const response = await addProject({
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
                description: '新建工程失败',
                status: 'error',
                position: 'top',
            });
        }
    };

    return (
        <Flex direction="column" h="100%">
            <HStack h="4rem" justify="space-between">
                <Text fontSize={16} fontWeight="bold">
                    所有项目
                </Text>
                <Button
                    leftIcon={<Icon as={FcPlus} boxSize={6} />}
                    colorScheme="pink"
                    onClick={onOpen}
                >
                    新建项目
                </Button>
                <ProjectModal
                    header="新建项目"
                    isOpen={isOpen}
                    onClose={onClose}
                    onConfirm={onSave}
                    loading={loading}
                />
            </HStack>
            <Divider />
            <Box flex="1">
                <ProjectViewer />
            </Box>
        </Flex>
    );
};

export default ProjectContainer;
