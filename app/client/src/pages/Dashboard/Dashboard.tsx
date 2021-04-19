import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Box, Flex } from '@chakra-ui/react';
import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import CatLoading from '../../components/Loading/CatLoading';
import { ColorModeSwitcher } from '../../components/theme/ColorModeSwitcher';
import { GLOBAL_CST } from '../../config/global';
import ActiveViewContainer from './ActiveView/ActiveViewContainer';
import SideNav from './SideNav/SideNav';

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
            <Box w="100vw" h="100vh">
                <CatLoading size="xl" />
            </Box>
        );
    }

    if (data?.verifyToken?.valid) {
        return (
            <Flex w="100vw" h="100vh">
                <Box w="18rem" h="100%">
                    <SideNav />
                </Box>
                <Box flex="1" h="100%">
                    <ActiveViewContainer />
                </Box>
                <Box position="fixed" right="0" bottom="0" p={4}>
                    <ColorModeSwitcher />
                </Box>
            </Flex>
        );
    } else {
        return <Redirect to="/login" />;
    }
};

export default Dashboard;
