import { Box } from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcExpired } from 'react-icons/fc';
import { Redirect, Route, Switch } from 'react-router-dom';
import EmptyPane from '../../../components/Exception/EmptyPane';
import Wrapper from '../Wrapper/Wrapper';
import IssueView from './Issue/IssueView';
import ProjectContainer from './Project/ProjectContainer';

const ActiveViewContainer: FC = () => {
    return (
        <Box pr={4} pt={4} pb={20} h="100%">
            <Wrapper h="100%">
                <Switch>
                    <Route path={'/settings'}>
                        <EmptyPane
                            icon={FcExpired}
                            text="貌似什么都没有噢ヽ(✿ﾟ▽ﾟ)ノ"
                        />
                        <EmptyPane />
                    </Route>
                    <Route path={'/development'}>
                        <EmptyPane />
                    </Route>
                    <Route path={'/project/:id'}>
                        <IssueView />
                    </Route>
                    <Route path={'/project'}>
                        <ProjectContainer />
                    </Route>
                    <Route path={'/'}>
                        <Redirect to="/project" />
                    </Route>
                </Switch>
            </Wrapper>
        </Box>
    );
};

export default ActiveViewContainer;
