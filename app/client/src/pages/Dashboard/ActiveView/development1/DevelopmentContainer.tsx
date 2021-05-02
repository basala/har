import {
    HStack,
    Icon,
    LinkBox,
    LinkOverlay,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { FC } from 'react';
import { IconType } from 'react-icons';
import { FcSms, FcSurvey } from 'react-icons/fc';
import { Link as RouterLink } from 'react-router-dom';
import EmptyPane from '../../../../components/Exception/EmptyPane';
import { RoutePath, useUrlPath } from '../../../../hooks/url';
import RobotView from './robot/RobotView';

const ITEMS: {
    title: string;
    path: string;
    icon: IconType;
}[] = [
    {
        title: '企业微信通知',
        path: `/${RoutePath.Development}/robot`,
        icon: FcSms,
    },
    {
        title: 'JIRA',
        path: `/${RoutePath.Development}/jira`,
        icon: FcSurvey,
    },
];

function createTab(tab: { title: string; path: string; icon: IconType }) {
    return (
        <LinkBox>
            <LinkOverlay as={RouterLink} to={tab.path}></LinkOverlay>
            <HStack spacing={2}>
                <Icon as={tab.icon} boxSize={6} />
                <Text fontSize={16} fontWeight="bold">
                    {tab.title}
                </Text>
            </HStack>
        </LinkBox>
    );
}

export const DevelopmentContainer: FC = () => {
    const [, path] = useUrlPath();
    const defaultIndex = _.findIndex(ITEMS, item => {
        return item.path === `/${RoutePath.Development}/${path}`;
    });

    return (
        <Tabs
            isLazy
            defaultIndex={defaultIndex > -1 ? defaultIndex : 0}
            h="100%"
            display="flex"
            flexDirection="column"
        >
            <TabList>
                {_.map(ITEMS, item => {
                    return <Tab key={item.title}>{createTab(item)}</Tab>;
                })}
            </TabList>
            <TabPanels flex="1" minH="1rem">
                <TabPanel h="100%">
                    <RobotView />
                </TabPanel>
                <TabPanel h="100%">
                    <EmptyPane />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};

export default DevelopmentContainer;
