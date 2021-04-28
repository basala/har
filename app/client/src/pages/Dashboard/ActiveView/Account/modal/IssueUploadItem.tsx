import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Checkbox,
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
import { HarResult } from './IssueUploadModal';

interface IssueUploadItemProps {
    har: HarResult;
    onChange: (selected: boolean) => void;
    onNameChange: (name: string) => void;
    onFieldChange: (fieldName: string, selected: boolean) => void;
}

const IssueUploadItem: FC<IssueUploadItemProps> = props => {
    const { har } = props;
    const isChecked = har.selected || false;
    const content = JSON.parse(har.content);
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
                    isChecked={isChecked}
                    onChange={event => {
                        props.onChange(event.target.checked);
                    }}
                />
                <Icon as={FcVideoFile} fontSize={25} />
                <Badge colorScheme="pink">{har.method}</Badge>
                <Editable
                    defaultValue={har.name}
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
                                需要匹配的字段(目前只支持data字段)
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <SimpleGrid columns={5}>
                                {_.map(_.keys(content.data), (key, index) => {
                                    return (
                                        <HStack
                                            key={index}
                                            spacing={1}
                                            h="2rem"
                                        >
                                            <Checkbox
                                                isChecked={_.includes(
                                                    har.fields,
                                                    `data.${key}`
                                                )}
                                                onChange={event => {
                                                    props.onFieldChange(
                                                        `data.${key}`,
                                                        event.target.checked
                                                    );
                                                }}
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
                                })}
                            </SimpleGrid>
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
