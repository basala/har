import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcExpired } from 'react-icons/fc';
import { Redirect, Route, Switch } from 'react-router-dom';
import EmptyPane from '../../../components/Exception/EmptyPane';
import { ColorModeSwitcher } from '../../../components/theme/ColorModeSwitcher';
import { baseRequest } from '../../../config/axios';
import { RoutePath } from '../../../hooks/url';
import Wrapper from '../Wrapper/Wrapper';
import AccountContainer from './Account/AccountContainer';
import DevelopmentContainer from './development/DevelopmentContainer';
import ProjectContainer from './Project/ProjectContainer';

const ActiveViewContainer: FC = () => {
    const [hitokoto, setHitokoto] = React.useState('');

    React.useEffect(() => {
        baseRequest
            .get<{
                hitokoto: string;
                from_who: string;
                from: string;
            }>('https://v1.hitokoto.cn')
            .then(res => {
                const { hitokoto, from, from_who } = res.data;

                setHitokoto(
                    `${hitokoto}    ----${from_who ? from_who : ''}${
                        from ? `【${from}】` : ''
                    }`
                );
            });
    }, []);

    return (
        <Flex pr={4} pt={4} h="100%" direction="column">
            <Wrapper flex="1" overflow="auto">
                <Switch>
                    <Route path={`/${RoutePath.Settings}`}>
                        <EmptyPane
                            icon={FcExpired}
                            text="貌似什么都没有噢ヽ(✿ﾟ▽ﾟ)ノ"
                        />
                    </Route>
                    <Route path={`/${RoutePath.Development}`}>
                        <DevelopmentContainer />
                    </Route>
                    <Route path={`/${RoutePath.Project}/:id`}>
                        <AccountContainer />
                    </Route>
                    <Route path={`/${RoutePath.Project}`}>
                        <ProjectContainer />
                    </Route>
                    <Route path={'/'}>
                        <Redirect to={`/${RoutePath.Project}`} />
                    </Route>
                </Switch>
            </Wrapper>
            <HStack h={20} justify="space-between">
                <Text
                    fontStyle="italic"
                    fontWeight="bold"
                    color="gray.500"
                    border="dashed transparent"
                    _hover={{ color: 'teal', borderColor: 'teal' }}
                >
                    {hitokoto}
                </Text>
                <Box p={4}>
                    <ColorModeSwitcher />
                </Box>
            </HStack>
        </Flex>
    );
};

export default ActiveViewContainer;
