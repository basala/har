import { ApolloProvider } from '@apollo/client';
import { ChakraProvider, theme } from '@chakra-ui/react';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { client } from './config/apollo';
import { RoutePath } from './hooks/url';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import ReportView from './pages/Report/ReportView';

export const App = () => (
    <ApolloProvider client={client}>
        <ChakraProvider theme={theme}>
            <BrowserRouter>
                <Switch>
                    <Route path={`/${RoutePath.Login}`}>
                        <Login />
                    </Route>
                    <Route path={`/${RoutePath.Report}/s/:id`}>
                        <ReportView />
                    </Route>
                    <Route path={'/'}>
                        <Dashboard />
                    </Route>
                </Switch>
            </BrowserRouter>
        </ChakraProvider>
    </ApolloProvider>
);
