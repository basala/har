import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GLOBAL_CST } from './global';

export const remoteUrl = process.env.REACT_APP_APOLLO_CLIENT_URL || '';

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem(GLOBAL_CST.LOCAL_STORAGE.AUTH_TOKEN);

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});
const httpLink = createHttpLink({
    uri: `${remoteUrl}/graphql`,
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});
