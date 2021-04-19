import { Center, Spinner, Stack, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import Logo from '../Logo/Logo';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingPros {
    loadingText?: string;
    size?: Size;
}

const CatLoading: FC<LoadingPros> = props => {
    const { loadingText = 'Waiting...', size = 'md' } = props;
    let spinnerSize;
    let imageSize;

    switch (size) {
        case 'xl':
            spinnerSize = '12rem';
            imageSize = '10rem';
            break;
        case 'lg':
            spinnerSize = '8rem';
            imageSize = '6rem';
            break;
        case 'sm':
            spinnerSize = '2rem';
            imageSize = '1rem';
            break;
        case 'md':
        default:
            spinnerSize = '4rem';
            imageSize = '3rem';
            break;
    }

    return (
        <Center w="100%" h="100%">
            <Stack position="absolute" spacing={0}>
                <Center>
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="pink.200"
                        boxSize={spinnerSize}
                    />
                </Center>
                <Center w="100%" h={spinnerSize} position="absolute">
                    <Logo boxSize={imageSize} />
                </Center>
                <Text textAlign="center">{loadingText}</Text>
            </Stack>
        </Center>
    );
};

export default CatLoading;
