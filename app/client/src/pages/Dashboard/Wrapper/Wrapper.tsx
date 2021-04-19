import { Box, ChakraProps } from '@chakra-ui/react';
import React, { FC } from 'react';

const Wrapper: FC<ChakraProps> = props => {
    return (
        <Box
            py={4}
            px={4}
            shadow="md"
            borderWidth="1px"
            borderRadius={8}
            {...props}
        >
            {props.children}
        </Box>
    );
};

export default Wrapper;
