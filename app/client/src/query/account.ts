import { gql } from '@apollo/client';

export const QUERY_ACCOUNT = gql`
    query account($input: String!) {
        findAllAccounts(input: $input) {
            id
            name
            environment {
                username
                password
            }
        }
    }
`;
