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
import { FcAndroidOs, FcConferenceCall, FcLink } from 'react-icons/fc';
import { RemoteUrl } from '../../../../../config/apollo';

interface RobotModalProps {
    header: string;
    loading: boolean;
    value?: RobotParams;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (input: RobotParams) => void;
}

export interface RobotParams {
    name: string;
    webhook: string;
    mentioned_list: string[];
}

const RobotModal: FC<RobotModalProps> = props => {
    const { header, isOpen, onClose, onConfirm, loading } = props;
    const [name, setName] = React.useState('');
    const [webhook, setWebhook] = React.useState('');
    const [mentionedList, setMentionedList] = React.useState('');
    const [connectionLoading, setConnectionLoading] = React.useState(false);

    React.useEffect(() => {
        setName(props.value?.name || '');
        setWebhook(props.value?.webhook || '');
        setMentionedList(props.value?.mentioned_list.join(', ') || '');
    }, [props.value, props.isOpen]);

    const toast = useToast();
    const checkValid = () => {
        if (!name || !webhook) {
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
        if (!webhook) {
            return;
        }

        setConnectionLoading(true);

        const response = await axios
            .post<{
                valid: boolean;
            }>(RemoteUrl + '/robot/connection', {
                webhook,
                mentioned_list: mentionedList.split(',').map(person => {
                    return person.trim();
                }),
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
    }, [webhook, mentionedList, toast]);

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
                                    children={
                                        <Icon as={FcAndroidOs} fontSize={20} />
                                    }
                                />
                                <Input
                                    placeholder="随便起个名字"
                                    defaultValue={name}
                                    onChange={event => {
                                        setName(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Hook</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={
                                        <Icon as={FcLink} fontSize={20} />
                                    }
                                />
                                <Input
                                    placeholder="webhook url"
                                    defaultValue={webhook}
                                    onChange={event => {
                                        setWebhook(event.target.value);
                                    }}
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel>成员(选填)</FormLabel>
                            <InputGroup>
                                <InputLeftElement
                                    children={
                                        <Icon
                                            as={FcConferenceCall}
                                            fontSize={20}
                                        />
                                    }
                                />
                                <Input
                                    placeholder="需要被@的人, 英文逗号分隔, 如果需要@所有人填 @all"
                                    defaultValue={mentionedList}
                                    onChange={event => {
                                        setMentionedList(event.target.value);
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
                        colorScheme="blue"
                        onClick={() => {
                            checkValid() &&
                                onConfirm({
                                    name,
                                    webhook,
                                    mentioned_list: mentionedList
                                        .split(',')
                                        .map(person => {
                                            return person.trim();
                                        }),
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

export default RobotModal;
