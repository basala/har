import Icon from '@chakra-ui/icon';
import { Center, Heading, Stack } from '@chakra-ui/layout';
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
                    <Icon as={icon} boxSize={60} />
                </Center>
                <Heading textAlign="center">{text}</Heading>
            </Stack>
        </Center>
    );
};

export default EmptyPane;
