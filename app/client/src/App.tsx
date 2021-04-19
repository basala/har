import { ApolloProvider } from '@apollo/client';
import { ChakraProvider, theme } from '@chakra-ui/react';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { client } from './config/apollo';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';

export const App = () => (
    <ApolloProvider client={client}>
        <ChakraProvider theme={theme}>
            <BrowserRouter>
                <Switch>
                    <Route path={'/login'}>
                        <Login />
                    </Route>
                    <Route key="2" path={'/'}>
                        <Dashboard />
                    </Route>
                </Switch>
            </BrowserRouter>
        </ChakraProvider>
    </ApolloProvider>
);
