import { AccountEnvironment, ProjectEnvironment } from '@entity';
import axios from 'axios';
import { get, isEmpty } from 'lodash';

export async function generateToken(
    projectEnv: ProjectEnvironment,
    accountEnv: AccountEnvironment
): Promise<{
    token: string;
    error?: string;
}> {
    const { host, authUrl, authBody, tokenPath } = projectEnv;
    const { username, password } = accountEnv;

    try {
        const response = await axios.post(
            host + authUrl,
            JSON.parse(
                authBody
                    .replace('$username', username)
                    .replace('$password', password)
            )
        );

        if (response.status === 200) {
            const token = get(response.data, JSON.parse(tokenPath));

            if (isEmpty(token)) {
                return {
                    token: '',
                    error:
                        '校验失败, 请检查账号密码是否正确或者工程配置是否正确',
                };
            }

            return {
                token,
            };
        } else {
            return {
                token: '',
                error: '校验失败, 请检查账号密码是否正确或者工程配置是否正确',
            };
        }
    } catch (error) {
        return {
            token: '',
            error: error.message,
        };
    }
}
