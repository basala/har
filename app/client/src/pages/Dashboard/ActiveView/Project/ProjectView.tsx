import { gql } from '@apollo/client';
import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Divider, Flex, Grid, HStack, Text } from '@chakra-ui/layout';
import { FC } from 'react';
import { FcAddDatabase } from 'react-icons/fc';
import CatLoading from '../../../../components/Loading/CatLoading';

const QUERY_PROJECT = gql`
    query project($input: SearchProjectInput!) {
        searchProject(input: $input) {
            name
            id
        }
    }
`;

const ADD_PROJECT = gql`
    mutation project($input: CreateProjectInput!) {
        createProject(input: $input) {
            id
        }
    }
`;

const ProjectView: FC = () => {
    return (
        <Flex direction="column" h="100%">
            <HStack h="4rem" justify="space-between">
                <Text fontSize={16} fontWeight="bold">
                    所有项目
                </Text>
                <Button
                    leftIcon={<Icon as={FcAddDatabase} boxSize={6} />}
                    colorScheme="pink"
                >
                    新建项目
                </Button>
            </HStack>
            <Divider />
            <Grid flex="1">
                <CatLoading size="lg" />
            </Grid>
        </Flex>
    );
};

export default ProjectView;
