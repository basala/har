import { useLocation } from 'react-router';

export enum RoutePath {
    Login = 'login',
    Project = 'project',
    Settings = 'settings',
    Development = 'development',
    Report = 'report',
}

export function useUrlPath() {
    const { pathname = '' } = useLocation();
    const [, modulePath, identify, sessionId] = pathname.split('/');

    switch (modulePath) {
        case RoutePath.Project:
        case RoutePath.Development:
            return [modulePath, identify];
        case RoutePath.Report:
            return [modulePath, identify === 's' ? sessionId : ''];
        case RoutePath.Login:
        case RoutePath.Settings:
        default:
            return [modulePath];
    }
}
