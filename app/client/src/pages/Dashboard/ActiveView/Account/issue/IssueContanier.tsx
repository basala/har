import { Center, Spinner, VStack } from '@chakra-ui/react';
import React, { FC } from 'react';

const IssueContainer: FC = () => {
    return (
        <VStack minH="10rem">
            <Center h="10rem">
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="pink.200"
                />
                Waiting...
            </Center>
        </VStack>
    );
};

export default IssueContainer;
