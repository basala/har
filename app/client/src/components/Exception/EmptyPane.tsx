import { Center, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { FC } from 'react';
import { IconType } from 'react-icons';
import { FcInTransit } from 'react-icons/fc';

interface EmptyPaneProps {
    text?: string;
    icon?: IconType;
}

const EmptyPane: FC<EmptyPaneProps> = props => {
    const { text = '施工中...', icon = FcInTransit } = props;

    return (
        <Center h="100%" w="100%">
            <Stack>
                <Center>
                    <Icon as={icon} boxSize={40} />
                </Center>
                <Text
                    textAlign="center"
                    fontSize={16}
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
