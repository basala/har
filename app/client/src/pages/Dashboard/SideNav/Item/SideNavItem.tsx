import {
    ComponentWithAs,
    HStack,
    Icon,
    IconProps,
    LinkBox,
    LinkOverlay,
    Text,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { IconType } from 'react-icons';
import { Link as RouterLink } from 'react-router-dom';

interface SideNavItemProps {
    href: string;
    text: string;
    icon: ComponentWithAs<'svg', IconProps> | IconType;
    selected?: boolean;
}

const SideNavItem: FC<SideNavItemProps> = props => {
    const { selected = false, href, icon, text } = props;

    return (
        <LinkBox w="100%" h="3rem">
            <LinkOverlay as={RouterLink} to={href}></LinkOverlay>
            <HStack
                spacing={2}
                px="0.5rem"
                height="100%"
                bg={selected ? 'tomato' : ''}
                color={selected ? 'white' : ''}
                fontWeight="bold"
                borderRadius="lg"
            >
                <Icon as={icon} boxSize={6} />
                <Text fontSize="1.2rem">{text}</Text>
            </HStack>
        </LinkBox>
    );
};

export default SideNavItem;
