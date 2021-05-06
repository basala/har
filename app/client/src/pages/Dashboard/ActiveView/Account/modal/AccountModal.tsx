import Icon from '@chakra-ui/icon';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast,
    VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { FC } from 'react';
import { FcBusinessman, FcFolder, FcLock } from 'react-icons/fc';
import { RemoteUrl } from '../../../../../config/apollo';
import { useUrlPath } from '../../../../../hooks/url';

interface AccountModalProps {
    header: string;
    loading: boolean;
    loadingText?: string;
    onConfirm: (name: string, environment: AccountParams) => void;
    name?: string;
    environment?: AccountParams;
    isOpen: boolean;
    onClose: () => void;
}

export interface AccountParams {
    username: string;
    password: string;
}

const AccountModal: FC<AccountModalProps> = props => {
    const {
        header,
        isOpen,
        onClose,
        onConfirm,
        loading,
        loadingText = '',
    } = props;
    const [, projectId] = useUrlPath();
    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [connectionLoading, setConnectionLoading] = React.useState(false);

    React.useEffect(() => {
        setName(props.name || '');
        setUsername(props.environment?.username || '');
        setPassword(props.environment?.password || '');
    }, [props.environment, props.isOpen, props.name]);

    const toast = useToast();
    const checkValid = () => {
        if (!name || !username || !password) {
            toast({
                description: '请先填写必填项',
                status: 'error',
                position: 'top',
            });

            return false;
        }

        return true;
    };
    const testConnection = React.useCallback(async () => {
        setConnectionLoading(true);

        const response = await axios
            .post<{
                valid: boolean;
            }>(RemoteUrl + '/account/connection', {
                projectId,
                username,
                password,
            })
            .catch(error => {
                return {
                    data: {
                        valid: false,
                    },
                };
            });

        setConnectionLoading(false);
        if (response.data.valid) {
            toast({
                description: '校验成功',
                status: 'success',
                position: 'top',
            });
        } else {
            toast({
                description: '校验失败',
                status: 'error',
                position: 'top',
            });
        }
    }, [projectId, username, password, toast]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} textAlign="left">
                        <FormControl isRequired>
                            <FormLabel>名称</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcFolder} />}
                                />
                                <Input
                                    placeholder="i need a name"
                                    defaultValue={name}
                                    onChange={event => {
                                        setName(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>账号</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcBusinessman} />}
                                />
                                <Input
                                    placeholder="测试账号"
                                    defaultValue={username}
                                    onChange={event => {
                                        setUsername(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>密码</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcLock} />}
                                />
                                <Input
                                    placeholder="密码"
                                    defaultValue={password}
                                    onChange={event => {
                                        setPassword(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Box flex="1">
                        <Button
                            colorScheme="teal"
                            justifySelf="flex-start"
                            isLoading={connectionLoading}
                            onClick={testConnection}
                        >
                            测试连接
                        </Button>
                    </Box>
                    <Button mr={3} onClick={onClose}>
                        取消
                    </Button>
                    <Button
                        isLoading={loading}
                        loadingText={loadingText}
                        colorScheme="blue"
                        onClick={() => {
                            checkValid() &&
                                onConfirm(name, {
                                    username,
                                    password,
                                });
                        }}
                    >
                        确认
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AccountModal;
