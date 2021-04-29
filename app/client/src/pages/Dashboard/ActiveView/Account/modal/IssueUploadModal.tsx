import { useQuery } from '@apollo/client';
import {
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
    Select,
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
import { useUrlPath } from '../../../../../hooks/url';
import { QUERY_ACCOUNT } from '../../../../../query/account';
import { AccountParams } from './AccountModal';
import IssueUploadItem from './IssueUploadItem';

interface IssueUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (input: { hars: HarResult[]; position: string }) => void;
    loading: boolean;
}

interface HarEntry extends Entry {
    _resourceType:
        | 'fetch'
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
    postData: string;
    fields: string[];
    selected?: boolean;
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
                            ((entry as HarEntry)._resourceType === 'xhr' ||
                                (entry as HarEntry)._resourceType ===
                                    'fetch') &&
                            entry.response.content.mimeType ===
                                'application/json'
                        );
                    })
                    .map(entry => {
                        const { request, response } = entry;
                        const content =
                            response.content.text || JSON.stringify('');
                        const data = JSON.parse(content);
                        const resolvable =
                            _.isPlainObject(data.data) &&
                            _.keys(data.data).length > 0;

                        return {
                            name: request.url,
                            url: request.url,
                            method: request.method.toUpperCase() as Method,
                            content,
                            postData:
                                request.postData?.text || JSON.stringify(''),
                            fields: resolvable
                                ? _.map(data.data, (value, key) => {
                                      return `data.${key}`;
                                  })
                                : ['data'],
                        };
                    }),
            ];
        },
        []
    );
}

const IssueUploadModal: FC<IssueUploadModalProps> = props => {
    const { isOpen, onClose, onConfirm, loading } = props;
    const [harLists, setHarLists] = React.useState<HarResult[]>([]);
    const [position, setPosition] = React.useState('');
    const [, projectId] = useUrlPath();
    const { data } = useQuery<
        {
            findAllAccounts: {
                id: string;
                name: string;
                environment: AccountParams;
            }[];
        },
        {
            input: string;
        }
    >(QUERY_ACCOUNT, {
        variables: {
            input: projectId,
        },
    });

    React.useEffect(() => {
        setHarLists([]);
        setPosition('');
    }, [props.isOpen]);

    const toast = useToast();
    const onDropAccepted = React.useCallback(async (acceptedFiles: File[]) => {
        const fileReaders: Promise<string>[] = [];
        acceptedFiles.forEach(file => {
            fileReaders.push(new Response(file).text());
        });
        const data = await Promise.all(fileReaders);

        try {
            const harLists = dealWithHarLists(data);

            if (_.size(harLists) === 0) {
                toast({
                    description: '未解析出有效请求',
                    position: 'top',
                    status: 'error',
                });
            }

            setHarLists(harLists);
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
                                    : _.size(harLists) === 0
                                    ? '点击或者拖拽上传文件...'
                                    : '重新上传...'}
                            </Text>
                        </Center>
                        {_.size(harLists) > 0 ? (
                            <Stack borderWidth={2} borderRadius={8} p={2}>
                                <Stack overflow="auto" maxH="25rem" spacing={4}>
                                    {_.map(harLists, (har, index) => {
                                        return (
                                            <IssueUploadItem
                                                key={index}
                                                har={har}
                                                onChange={selected => {
                                                    setHarLists(
                                                        harLists.map(
                                                            (har, idx) => {
                                                                return {
                                                                    ...har,
                                                                    selected:
                                                                        index ===
                                                                        idx
                                                                            ? selected
                                                                            : har.selected,
                                                                };
                                                            }
                                                        )
                                                    );
                                                }}
                                                onNameChange={name => {
                                                    setHarLists(
                                                        harLists.map(
                                                            (har, idx) => {
                                                                return {
                                                                    ...har,
                                                                    name:
                                                                        index ===
                                                                        idx
                                                                            ? name
                                                                            : har.name,
                                                                };
                                                            }
                                                        )
                                                    );
                                                }}
                                                onFieldChange={(
                                                    fieldName,
                                                    selected
                                                ) => {
                                                    setHarLists(
                                                        harLists.map(
                                                            (har, idx) => {
                                                                return {
                                                                    ...har,
                                                                    fields:
                                                                        index ===
                                                                        idx
                                                                            ? selected
                                                                                ? [
                                                                                      ...har.fields,
                                                                                      fieldName,
                                                                                  ]
                                                                                : har.fields.filter(
                                                                                      value =>
                                                                                          value !==
                                                                                          fieldName
                                                                                  )
                                                                            : har.fields,
                                                                };
                                                            }
                                                        )
                                                    );
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                                <HStack spacing={2}>
                                    <Button
                                        colorScheme="blue"
                                        onClick={() => {
                                            setHarLists(
                                                harLists.map(har => {
                                                    return {
                                                        ...har,
                                                        selected: true,
                                                    };
                                                })
                                            );
                                        }}
                                    >
                                        全选
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setHarLists(
                                                harLists.map(har => {
                                                    return {
                                                        ...har,
                                                        selected: false,
                                                    };
                                                })
                                            );
                                        }}
                                    >
                                        反选
                                    </Button>
                                    <Text>至少选择一项噢</Text>
                                </HStack>
                            </Stack>
                        ) : (
                            <></>
                        )}
                        {_.size(harLists) > 0 ? (
                            <HStack spacing={4}>
                                <Text fontSize={14} fontWeight="bold">
                                    保存账号:
                                </Text>
                                <Select
                                    placeholder="选择账号"
                                    variant="filled"
                                    w="10rem"
                                    onChange={event => {
                                        setPosition(event.target.value);
                                    }}
                                >
                                    {_.map(
                                        data?.findAllAccounts,
                                        (account, index) => {
                                            const { id, name } = account;

                                            return (
                                                <option key={index} value={id}>
                                                    {name}
                                                </option>
                                            );
                                        }
                                    )}
                                </Select>
                            </HStack>
                        ) : (
                            <></>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        取消
                    </Button>
                    <Button
                        colorScheme="blue"
                        disabled={
                            _.size(harLists.filter(har => har.selected)) ===
                                0 ||
                            _.isEmpty(position) ||
                            loading
                        }
                        isLoading={loading}
                        onClick={() => {
                            onConfirm({
                                hars: harLists
                                    .filter(har => har.selected)
                                    .map(har => {
                                        return {
                                            name: har.name,
                                            url: har.url,
                                            method: har.method,
                                            content: har.content,
                                            postData: har.postData,
                                            fields: har.fields,
                                        };
                                    }),
                                position,
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

export default IssueUploadModal;
