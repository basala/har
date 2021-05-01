import axios from 'axios';
import { RemoteUrl } from './apollo';
import { GLOBAL_CST } from './global';

const token = localStorage.getItem(GLOBAL_CST.LOCAL_STORAGE.AUTH_TOKEN);

export const baseRequest = axios.create({
    baseURL: RemoteUrl,
    headers: {
        authorization: token ? `Bearer ${token}` : '',
    },
});
