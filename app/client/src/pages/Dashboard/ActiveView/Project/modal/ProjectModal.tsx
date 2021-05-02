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
    Textarea,
    useToast,
    VStack,
} from '@chakra-ui/react';
import React, { FC, useEffect } from 'react';
import { FcFilingCabinet, FcFolder, FcKey, FcServices } from 'react-icons/fc';

interface ProjectModalProps {
    header: string;
    loading: boolean;
    loadingText?: string;
    onConfirm: (input: ProjectParams) => void;
    value?: Partial<ProjectParams>;
    isOpen: boolean;
    onClose: () => void;
}

export interface ProjectParams {
    name: string;
    environment: {
        host: string;
        authUrl: string;
        authBody: string;
        tokenPath: string;
    };
}

const defaultValue: ProjectParams = {
    name: '',
    environment: {
        host: '',
        authUrl: '/decision/v1/login/password',
        authBody: `{
    "mobile": "$username",
    "password": "$password",
    "encrypted": false
}`,
        tokenPath: 'data.token',
    },
};

const ProjectModal: FC<ProjectModalProps> = props => {
    const {
        header,
        isOpen,
        onClose,
        onConfirm,
        loading,
        loadingText = '',
    } = props;
    const [name, setName] = React.useState('');
    const [host, setHost] = React.useState('');
    const [authUrl, setAuthUrl] = React.useState('');
    const [authBody, setAuthBody] = React.useState('');
    const [tokenPath, setTokenPath] = React.useState('');

    useEffect(() => {
        setName(props.value?.name || defaultValue.name);
        setHost(
            props.value?.environment?.host || defaultValue.environment.host
        );
        setAuthUrl(
            props.value?.environment?.authUrl ||
                defaultValue.environment.authUrl
        );
        setAuthBody(
            props.value?.environment?.authBody ||
                defaultValue.environment.authBody
        );
        setTokenPath(
            props.value?.environment?.tokenPath ||
                defaultValue.environment.tokenPath
        );
    }, [props.value, props.isOpen]);

    const toast = useToast();
    const checkValid = () => {
        if (!name || !host || !authUrl || !authBody || !tokenPath) {
            toast({
                description: '请先填写必填项',
                status: 'error',
                position: 'top',
            });

            return false;
        }

        try {
            if (typeof JSON.parse(authBody) == 'object') {
                return true;
            }
        } catch {}

        toast({
            description: '存在不符合json格式的项',
            status: 'error',
            position: 'top',
        });

        return false;
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
                            <FormLabel>工程名</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcFolder} />}
                                />
                                <Input
                                    placeholder="eg: 测试工程"
                                    value={name}
                                    onChange={event => {
                                        setName(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>工程地址</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcFilingCabinet} />}
                                />
                                <Input
                                    placeholder="eg: https://test.jiushuyun.com"
                                    value={host}
                                    onChange={event => {
                                        setHost(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>登录校验Path</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcKey} />}
                                />
                                <Input
                                    placeholder="eg: /decision/v1/login/password"
                                    value={authUrl}
                                    onChange={event => {
                                        setAuthUrl(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>登录校验参数</FormLabel>
                            <Textarea
                                minH="14rem"
                                placeholder={`eg: 需要预留 $username 和 $password 用于登录验证, json格式"
{
    "mobile": "$username",
    "password": "$password",
    "encrypted": false,
}
                                `}
                                value={authBody}
                                onChange={event => {
                                    setAuthBody(event.target.value);
                                }}
                                resize="none"
                            ></Textarea>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Token Path</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={<Icon as={FcServices} />}
                                />
                                <Input
                                    placeholder={'eg: data.token'}
                                    value={tokenPath}
                                    onChange={event => {
                                        setTokenPath(event.target.value);
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
                                    name,
                                    environment: {
                                        host,
                                        authUrl,
                                        authBody,
                                        tokenPath,
                                    },
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

export default ProjectModal;
