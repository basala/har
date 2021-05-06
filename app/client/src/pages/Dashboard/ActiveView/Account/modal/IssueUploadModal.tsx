import { useQuery } from '@apollo/client';
import {
    Button,
    Center,
    HStack,
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
import { FcSearch } from 'react-icons/fc';
import { useUrlPath } from '../../../../../hooks/url';
import { QUERY_ACCOUNT } from '../../../../../query/account';
import { AccountParams } from './AccountModal';
import IssueUploadItem from './IssueUploadItem';

export interface RequestData {
    mimeType: string;
    text: string;
}

export interface HarResult {
    url: string;
    method: Method;
    content: RequestData;
    postData: RequestData;
}

export interface MemoizedHarResult extends HarResult {
    index: number;
    name: string;
    fields: string[];
    selected: boolean;
}

interface IssueUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (input: {
        hars: Omit<MemoizedHarResult, 'selected'>[];
        position: string;
    }) => void;
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

                        return {
                            url: request.url,
                            method: request.method.toUpperCase() as Method,
                            content: {
                                mimeType: response.content.mimeType,
                                text:
                                    response.content.text || JSON.stringify(''),
                            },
                            postData: {
                                mimeType: request.postData?.mimeType || '',
                                text:
                                    request.postData?.text ||
                                    JSON.stringify(''),
                            },
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
    const [memoizedHarLists, setMemoizedHarLists] = React.useState<
        MemoizedHarResult[]
    >([]);
    const [keyword, setKeyword] = React.useState('');
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
        setMemoizedHarLists(
            _.map(harLists, (har, index) => {
                const content = JSON.parse(har.content.text);
                const resolvable =
                    _.isPlainObject(content.data) &&
                    _.keys(content.data).length > 0;

                return {
                    ...har,
                    name: har.url,
                    fields: resolvable
                        ? _.map(content.data, (value, key) => {
                              return `data.${key}`;
                          })
                        : ['data'],
                    selected: false,
                    index,
                };
            })
        );
    }, [harLists]);
    React.useEffect(() => {
        setHarLists([]);
        setPosition('');
        setKeyword('');
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
                        {_.size(memoizedHarLists) > 0 ? (
                            <Stack borderWidth={2} borderRadius={8} p={2}>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<FcSearch />}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="搜索"
                                        onBlur={event => {
                                            setKeyword(
                                                `/${event.target.value}`
                                            );
                                        }}
                                    />
                                </InputGroup>
                                <Stack overflow="auto" maxH="25rem" spacing={4}>
                                    {_.map(
                                        _.isEmpty(keyword)
                                            ? memoizedHarLists
                                            : memoizedHarLists.filter(har => {
                                                  return har.url.match(keyword);
                                              }),
                                        (har, index) => {
                                            return (
                                                <IssueUploadItem
                                                    key={har.index}
                                                    har={har}
                                                    onChange={selected => {
                                                        const newValue = [
                                                            ...memoizedHarLists,
                                                        ];
                                                        newValue[
                                                            index
                                                        ].selected = selected;
                                                        setMemoizedHarLists(
                                                            newValue
                                                        );
                                                    }}
                                                    onNameChange={name => {
                                                        const newValue = [
                                                            ...memoizedHarLists,
                                                        ];
                                                        newValue[
                                                            index
                                                        ].name = name;
                                                        setMemoizedHarLists(
                                                            newValue
                                                        );
                                                    }}
                                                    onFieldChange={(
                                                        fields: string[]
                                                    ) => {
                                                        const newValue = [
                                                            ...memoizedHarLists,
                                                        ];
                                                        newValue[
                                                            index
                                                        ].fields = fields;
                                                        setMemoizedHarLists(
                                                            newValue
                                                        );
                                                    }}
                                                />
                                            );
                                        }
                                    )}
                                </Stack>
                                <HStack spacing={2}>
                                    <Button
                                        colorScheme="blue"
                                        onClick={() => {
                                            const newValue = memoizedHarLists.map(
                                                har => {
                                                    return {
                                                        ...har,
                                                        selected:
                                                            _.isEmpty(
                                                                keyword
                                                            ) ||
                                                            har.url.match(
                                                                keyword
                                                            )
                                                                ? true
                                                                : har.selected,
                                                    };
                                                }
                                            );
                                            setMemoizedHarLists(newValue);
                                        }}
                                    >
                                        全选
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const newValue = memoizedHarLists.map(
                                                har => {
                                                    return {
                                                        ...har,
                                                        selected:
                                                            _.isEmpty(
                                                                keyword
                                                            ) ||
                                                            har.url.match(
                                                                keyword
                                                            )
                                                                ? false
                                                                : har.selected,
                                                    };
                                                }
                                            );
                                            setMemoizedHarLists(newValue);
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
                        {_.size(memoizedHarLists) > 0 ? (
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
                            _.size(
                                memoizedHarLists.filter(har => har.selected)
                            ) === 0 ||
                            _.isEmpty(position) ||
                            loading
                        }
                        isLoading={loading}
                        onClick={() => {
                            console.log(1);
                            onConfirm({
                                hars: memoizedHarLists
                                    .filter(har => har.selected)
                                    .map(har => {
                                        const { selected, ...rest } = har;

                                        return rest;
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
