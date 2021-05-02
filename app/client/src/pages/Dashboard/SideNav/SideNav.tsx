import { Stack, VStack } from '@chakra-ui/react';
import React, { FC } from 'react';
import { IconType } from 'react-icons';
import {
    FcBiomass,
    FcHome,
    FcPositiveDynamic,
    FcSettings,
} from 'react-icons/fc';
import { matchPath } from 'react-router-dom';
import { RoutePath, useUrlPath } from '../../../hooks/url';
import Wrapper from '../Wrapper/Wrapper';
import SideNavItem from './Item/SideNavItem';
import UserMenu from './UserMenu/UserMenu';

const ITEMS: {
    title: string;
    path: RoutePath;
    icon: IconType;
}[] = [
    {
        title: '项目',
        path: RoutePath.Project,
        icon: FcHome,
    },
    {
        title: '设置',
        path: RoutePath.Settings,
        icon: FcSettings,
    },
    {
        title: '实验室',
        path: RoutePath.Development,
        icon: FcBiomass,
    },
    {
        title: '统计',
        path: RoutePath.Report,
        icon: FcPositiveDynamic,
    },
];

const SideNav: FC = () => {
    const [modulePath] = useUrlPath();

    return (
        <Stack py={4} px={6} h="100%" spacing={6}>
            <Wrapper
                bgGradient={[
                    'linear(to-tr, teal.100,yellow.200)',
                    'linear(to-t, blue.100, teal.300)',
                    'linear(to-b, orange.100, pink.200)',
                ]}
            >
                <UserMenu />
            </Wrapper>
            <Wrapper>
                <VStack minH="30rem">
                    {ITEMS.map((item, index) => {
                        const href = `/${item.path}`;

                        return (
                            <SideNavItem
                                key={index}
                                href={href}
                                icon={item.icon}
                                text={item.title}
                                selected={
                                    matchPath(modulePath, {
                                        path: item.path,
                                        exact: true,
                                    })
                                        ? true
                                        : false
                                }
                            />
                        );
                    })}
                </VStack>
            </Wrapper>
        </Stack>
    );
};

export default SideNav;
