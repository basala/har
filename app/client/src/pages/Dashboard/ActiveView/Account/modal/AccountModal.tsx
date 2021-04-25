import Icon from '@chakra-ui/icon';
import {
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
import React, { FC } from 'react';
import { FcBusinessman, FcLock } from 'react-icons/fc';

interface AccountModalProps {
    header: string;
    loading: boolean;
    loadingText?: string;
    onConfirm: (input: AccountParams) => void;
    value?: Partial<AccountParams>;
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
        value = { username: '', password: '' },
    } = props;
    const [username, setUsername] = React.useState(value.username);
    const [password, setPassword] = React.useState(value.password);

    const toast = useToast();
    const checkValid = () => {
        if (!username || !password) {
            toast({
                description: '请先填写必填项',
                status: 'error',
                position: 'top',
            });

            return false;
        }

        return true;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} textAlign="left">
                        <FormControl isRequired>
                            <FormLabel>账号</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcBusinessman} />}
                                />
                                <Input
                                    placeholder="测试账号"
                                    defaultValue={value.username}
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
                                    defaultValue={value.password}
                                    onChange={event => {
                                        setPassword(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        取消
                    </Button>
                    <Button
                        isLoading={loading}
                        loadingText={loadingText}
                        colorScheme="blue"
                        onClick={() => {
                            checkValid() &&
                                onConfirm({
                                    username: username || '',
                                    password: password || '',
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
