import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Box, Center, chakra, Spinner, Stack, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { ColorModeSwitcher } from '../../components/theme/ColorModeSwitcher';
import { GLOBAL_CST } from '../../config/global';
import logo from './cat.svg';

const VERIFY_TOKEN = gql`
    query auth($token: String!) {
        verifyToken(token: $token) {
            valid
        }
    }
`;

const Dashboard: FC = () => {
    const token = localStorage.getItem(GLOBAL_CST.LOCAL_STORAGE.AUTH_TOKEN);

    if (!token) {
        return <Redirect to="/login" />;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, loading } = useQuery<
        {
            verifyToken: {
                valid: boolean;
            };
        },
        {
            token: string;
        }
    >(VERIFY_TOKEN, {
        variables: {
            token: token!,
        },
    });

    if (loading) {
        return (
            <Center w="100vw" h="100vh">
                <Stack position="absolute">
                    <chakra.img
                        src={logo}
                        position="absolute"
                        w="8rem"
                        h="8rem"
                        top="1.5rem"
                        left="1rem"
                    />
                    ;
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="pink.200"
                        w="10rem"
                        h="10rem"
                    />
                    <Text textAlign="center">Waiting...</Text>
                </Stack>
            </Center>
        );
    }

    if (data?.verifyToken?.valid) {
        return (
            <Box fontSize="xl" minH="100vh" p={3}>
                <ColorModeSwitcher />
            </Box>
        );
    } else {
        return <Redirect to="/login" />;
    }
};

export default Dashboard;
