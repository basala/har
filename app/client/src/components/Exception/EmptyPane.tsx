import { Center, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { FC } from 'react';
import { IconType } from 'react-icons';
import { FcInTransit } from 'react-icons/fc';

interface EmptyPaneProps {
    text?: string;
    icon?: IconType;
    fontSize?: number;
    iconSize?: number;
}

const EmptyPane: FC<EmptyPaneProps> = props => {
    const {
        text = '施工中...',
        icon = FcInTransit,
        fontSize = 16,
        iconSize = 40,
    } = props;

    return (
        <Center h="100%" w="100%">
            <Stack>
                <Center>
                    <Icon as={icon} boxSize={iconSize} />
                </Center>
                <Text
                    textAlign="center"
                    fontSize={fontSize}
                    fontWeight="bold"
                    color={useColorModeValue('blackAlpha.600', 'light')}
                >
                    {text}
                </Text>
            </Stack>
        </Center>
    );
};

export default EmptyPane;
