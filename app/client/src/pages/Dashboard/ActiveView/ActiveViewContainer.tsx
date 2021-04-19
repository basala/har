import { Box } from '@chakra-ui/react';
import React, { FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import EmptyPane from '../../../components/Exception/EmptyPane';
import Wrapper from '../Wrapper/Wrapper';
import IssueView from './Issue/IssueView';
import ProjectView from './Project/ProjectView';

const ActiveViewContainer: FC = () => {
    return (
        <Box pr={4} pt={4} pb={20} h="100%">
            <Wrapper h="100%">
                <Switch>
                    <Route path={'/settings'}>
                        <EmptyPane />
                    </Route>
                    <Route path={'/development'}>
                        <EmptyPane text="还没想好放些啥..." />
                    </Route>
                    <Route path={'/project/:id'}>
                        <IssueView />
                    </Route>
                    <Route path={'/project'}>
                        <ProjectView />
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
