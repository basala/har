import {
    Box,
    Button,
    Center,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { Method } from 'axios';
import { Entry, Har } from 'har-format';
import _ from 'lodash';
import React, { FC } from 'react';
import { useDropzone } from 'react-dropzone';
import IssueUploadItem from './IssueUploadItem';

interface IssueUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface HarEntry extends Entry {
    _resourceType:
        | 'xhr'
        | 'image'
        | 'websocket'
        | 'script'
        | 'font'
        | 'stylesheet';
}

export interface HarResult {
    name: string;
    url: string;
    method: Method;
    content: string;
}

function dealWithHarLists(inputs: string[]) {
    return _.reduce<string, HarResult[]>(
        inputs,
        (pre, cur) => {
            const harObj: Har = JSON.parse(cur);

            return [
                ...pre,
                ...harObj.log.entries
                    .filter(entry => {
                        return (
                            (entry as HarEntry)._resourceType === 'xhr' &&
                            entry.response.content.mimeType ===
                                'application/json'
                        );
                    })
                    .map(entry => {
                        const { request, response } = entry;

                        return {
                            name: request.url,
                            url: request.url,
                            method: request.method.toUpperCase() as Method,
                            content: response.content.text || '',
                        };
                    }),
            ];
        },
        []
    );
}

const IssueUploadModal: FC<IssueUploadModalProps> = props => {
    const { isOpen, onClose } = props;
    const [harLists, setHarLists] = React.useState<HarResult[]>([]);

    const toast = useToast();
    const onDropAccepted = React.useCallback(async (acceptedFiles: File[]) => {
        const fileReaders: Promise<string>[] = [];
        acceptedFiles.forEach(file => {
            fileReaders.push(new Response(file).text());
        });
        const data = await Promise.all(fileReaders);

        try {
            const harLists = dealWithHarLists(data);
            setHarLists(harLists);
            toast({
                description: '上传成功!',
                position: 'top',
                status: 'success',
            });
        } catch (e) {
            toast({
                description: '上传失败!',
                position: 'top',
                status: 'error',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: false,
        accept: '.har',
        maxFiles: 1,
        onDropAccepted,
        onDropRejected: () => {
            toast({
                description: '上传失败!',
                position: 'top',
                status: 'error',
            });
        },
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>上传Har用例</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Center
                            {...getRootProps({ className: 'dropzone' })}
                            h="5rem"
                            color="gray.400"
                            borderRadius={4}
                            border="dashed"
                            borderColor={isDragActive ? 'teal' : 'gray.400'}
                            transition="border .24s ease-in-out"
                            outline="none"
                            cursor="pointer"
                        >
                            <input {...getInputProps()} />
                            <Text
                                fontStyle="italic"
                                fontSize={16}
                                fontWeight="bold"
                            >
                                {isDragActive
                                    ? 'Tips: 仅支持HAR文件'
                                    : '点击或者拖拽上传文件...'}
                            </Text>
                        </Center>
                        {_.size(harLists) > 0 ? (
                            <Stack borderWidth={2} borderRadius={8} p={2}>
                                <Box overflow="auto" maxH="25rem">
                                    {_.map(harLists, (har, index) => {
                                        return (
                                            <IssueUploadItem
                                                key={index}
                                                name={har.name}
                                                url={har.url}
                                                method={har.method}
                                                selected={false}
                                                onChange={name => {
                                                    harLists[index].name = name;
                                                    setHarLists(harLists);
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                                <HStack>
                                    <Button>全选</Button>
                                    <Button>反选</Button>
                                    <Text>请至少选择一项</Text>
                                </HStack>
                            </Stack>
                        ) : (
                            <></>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        取消
                    </Button>
                    <Button colorScheme="blue" disabled={_.size(harLists) < 0}>
                        确认
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default IssueUploadModal;
