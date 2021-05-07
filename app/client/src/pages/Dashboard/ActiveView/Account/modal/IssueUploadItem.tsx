import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Checkbox,
    CheckboxGroup,
    Editable,
    EditableInput,
    EditablePreview,
    HStack,
    Icon,
    SimpleGrid,
    Stack,
    Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcVideoFile } from 'react-icons/fc';
import { MemoizedHarResult } from './IssueUploadModal';

interface IssueUploadItemProps {
    har: MemoizedHarResult;
    onChange: (selected: boolean) => void;
    onNameChange: (name: string) => void;
    onFieldChange: (value: string[]) => void;
}

const IssueUploadItem: FC<IssueUploadItemProps> = props => {
    const { har } = props;

    const content = JSON.parse(har.content.text);
    const resolvable =
        _.isPlainObject(content.data) && _.keys(content.data).length > 0;

    return (
        <Stack
            borderWidth={1}
            borderRadius={4}
            boxShadow="md"
            spacing={1}
            p={2}
        >
            <HStack>
                <Checkbox
                    isChecked={har.selected}
                    onChange={event => {
                        props.onChange(event.target.checked);
                    }}
                />
                <Icon as={FcVideoFile} fontSize={25} />
                <Badge colorScheme="pink">{har.method}</Badge>
                <Editable
                    defaultValue={har.url}
                    title={har.url}
                    w="1rem"
                    flex="1"
                    onSubmit={props.onNameChange}
                >
                    <EditablePreview
                        w="100%"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    />
                    <EditableInput />
                </Editable>
            </HStack>
            {resolvable ? (
                <Accordion allowToggle>
                    <AccordionItem>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                需要匹配的字段(目前只支持data字段,
                                未勾选代表比较整个data)
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <CheckboxGroup
                                defaultValue={_.map(
                                    _.keys(content.data),
                                    key => {
                                        return `data.${key}`;
                                    }
                                )}
                                onChange={(value: string[]) => {
                                    props.onFieldChange(
                                        _.isEmpty(value) ? ['data'] : value
                                    );
                                }}
                            >
                                <SimpleGrid columns={5}>
                                    {_.map(
                                        _.keys(content.data),
                                        (key, index) => {
                                            return (
                                                <HStack
                                                    key={index}
                                                    spacing={1}
                                                    h="2rem"
                                                >
                                                    <Checkbox
                                                        defaultChecked
                                                        value={`data.${key}`}
                                                    ></Checkbox>
                                                    <Text
                                                        flex="1"
                                                        whiteSpace="nowrap"
                                                        overflow="hidden"
                                                        textOverflow="ellipsis"
                                                    >
                                                        {key}
                                                    </Text>
                                                </HStack>
                                            );
                                        }
                                    )}
                                </SimpleGrid>
                            </CheckboxGroup>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            ) : (
                <></>
            )}
        </Stack>
    );
};

export default IssueUploadItem;
