import { EditIcon } from '@chakra-ui/icons';
import {
    ChakraProps,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { FcMenu } from 'react-icons/fc';
import { useHistory } from 'react-router';
import Logo from '../../../../components/Logo/Logo';
import { GLOBAL_CST } from '../../../../config/global';

const UserMenu: FC<ChakraProps> = props => {
    const history = useHistory();
    const username = localStorage.getItem(GLOBAL_CST.LOCAL_STORAGE.USER_NAME);

    return (
        <Menu autoSelect={false}>
            <MenuButton w="100%">
                <HStack spacing={4} justify="space-between">
                    <HStack spacing={4}>
                        <Logo w="2rem" h="2em" />
                        <Text
                            fontSize={20}
                            fontWeight="bold"
                            color={useColorModeValue('blackAlpha.800', 'light')}
                        >
                            {username}
                        </Text>
                    </HStack>
                    <Icon as={FcMenu} />
                </HStack>
            </MenuButton>
            <MenuList>
                <MenuItem icon={<EditIcon />}>账号设置...</MenuItem>
                <MenuDivider />
                <MenuItem
                    icon={<Icon as={AiOutlineLogout} />}
                    onClick={() => {
                        localStorage.removeItem(
                            GLOBAL_CST.LOCAL_STORAGE.AUTH_TOKEN
                        );
                        history.push('/login');
                    }}
                >
                    退出
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default UserMenu;
