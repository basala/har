import { gql } from '@apollo/client';

export const QUERY_ROBOTS = gql`
    query findAllRobots {
        findAllRobots {
            id
            name
            webhook
            mentioned_list
            updateAt
        }
    }
`;
