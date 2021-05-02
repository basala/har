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

export interface FindAllRobotsResponse {
    findAllRobots: {
        id: string;
        name: string;
        webhook: string;
        mentioned_list: string[];
        updateAt: number;
    }[];
}
