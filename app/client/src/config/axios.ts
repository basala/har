import axios from 'axios';
import { RemoteUrl } from './apollo';
import { GLOBAL_CST } from './global';

axios.defaults.baseURL = RemoteUrl;
axios.interceptors.request.use(config => {
    const token = localStorage.getItem(GLOBAL_CST.LOCAL_STORAGE.AUTH_TOKEN);

    config.headers = {
        ...config.headers,
        authorization: token ? `Bearer ${token}` : '',
    };

    return config;
});
