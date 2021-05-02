import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Icon,
    Stack,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcFolder, FcOpenedFolder } from 'react-icons/fc';
import EmptyPane from '../../components/Exception/EmptyPane';
import ReportIssueItem, { ExecutionResult } from './ReportIssueItem';

interface ReportAccountItemProps {
    name: string;
    issues: ExecutionResult[];
}

const ReportAccountItem: FC<ReportAccountItemProps> = props => {
    const { issues, name } = props;

    return (
        <Accordion allowToggle defaultIndex={[0]}>
            <AccordionItem borderWidth={1} boxShadow="md">
                {({ isExpanded }) => {
                    return (
                        <>
                            <AccordionButton
                                as={Box}
                                cursor="pointer"
                                position="sticky"
                                top="0"
                                _hover={{
                                    bg: '',
                                }}
                                _focus={{
                                    border: '0',
                                }}
                                h="4rem"
                                bg={
                                    '#fff linear-gradient( 135deg, rgba(250, 215, 161, 0.3) 10%, rgba(233, 109, 133, 0.3) 100%);'
                                }
                            >
                                <Icon
                                    as={isExpanded ? FcOpenedFolder : FcFolder}
                                    boxSize={8}
                                    mr="1rem"
                                />
                                <Box
                                    flex="1"
                                    textAlign="left"
                                    fontWeight="bold"
                                >
                                    {name}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel minH="4rem">
                                <Stack spacing={4}>
                                    {_.isEmpty(issues) ? (
                                        <EmptyPane
                                            icon={FcExpired}
                                            text="空空如也噢ヽ(✿ﾟ▽ﾟ)ノ"
                                        />
                                    ) : (
                                        _.map(issues, issue => {
                                            return (
                                                <ReportIssueItem
                                                    key={issue.data.id}
                                                    issue={issue}
                                                />
                                            );
                                        })
                                    )}
                                </Stack>
                            </AccordionPanel>
                        </>
                    );
                }}
            </AccordionItem>
        </Accordion>
    );
};

export default ReportAccountItem;
