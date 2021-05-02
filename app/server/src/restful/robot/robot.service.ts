import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RobotService {
    async sendTextMsg(
        webhook: string,
        mentioned_list: string[],
        text?: string
    ) {
        const content =
            text ||
            (await axios
                .get<{
                    hitokoto: string;
                    from_who: string;
                    from: string;
                }>('https://v1.hitokoto.cn')
                .then(res => {
                    const { hitokoto, from, from_who } = res.data;

                    return `这是一条测试消息:\n${hitokoto} --${
                        from_who ? from_who : ''
                    }${from ? `【${from}】` : ''}`;
                })
                .catch(error => {
                    return '这是一条测试消息';
                }));

        return axios
            .post(
                webhook,
                {
                    msgtype: 'text',
                    text: {
                        content,
                        mentioned_list,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then(() => {
                Logger.log('msg send success', 'SendTextMsg');
            })
            .catch(error => {
                Logger.error('msg send fail', error.stack, 'SendTextMsg');
                throw new Error(error);
            });
    }
}
