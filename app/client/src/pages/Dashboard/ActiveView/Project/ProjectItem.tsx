import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Center,
    Flex,
    Icon,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcPackage, FcSettings } from 'react-icons/fc';
import { Link as RouterLink } from 'react-router-dom';
import ProjectModal, { ProjectParams } from './ProjectModal';

interface ProjectItemProps extends ProjectParams {
    id: string;
}

const ProjectItem: FC<ProjectItemProps> = props => {
    const { name, id } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();

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
                        <Text
                            h="2rem"
                            fontWeight="bold"
                            color={useColorModeValue('teal.500', 'light')}
                        >
                            {name}
                        </Text>
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
                    // m={2}
                ></MenuButton>
                <MenuList>
                    <MenuItem icon={<EditIcon />} onClick={onOpen}>
                        配置
                    </MenuItem>
                    <ProjectModal
                        isOpen={isOpen}
                        onClose={onClose}
                        onConfirm={() => {}}
                        header={name}
                        loading={false}
                        value={props}
                    />
                    <MenuItem icon={<DeleteIcon />} onClick={() => {}}>
                        删除
                    </MenuItem>
                </MenuList>
            </Menu>
        </Stack>
    );
};

export default ProjectItem;
