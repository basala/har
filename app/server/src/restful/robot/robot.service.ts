import { RobotEntity } from '@entity';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { getMongoRepository } from 'typeorm';

@Injectable()
export class RobotService {
    async sendMsgById(id: string, type: 'text' | 'markdown', msg: string) {
        const robot = await getMongoRepository(RobotEntity).findOne({
            _id: id,
        });

        if (!robot) {
            throw new ForbiddenException('robot does not exist');
        }

        return this.sendMsg(robot.webhook, robot.mentioned_list, msg, type);
    }

    async sendMsg(
        webhook: string,
        mentioned_list: string[],
        msg = '',
        type: 'text' | 'markdown' = 'text'
    ) {
        const content =
            msg ||
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

        const data = {
            msgtype: type,
            [type]: {
                content,
                ...(type === 'text' ? { mentioned_list } : {}),
            },
        };

        return axios
            .post(webhook, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(() => {
                if (type === 'markdown') {
                    return axios.post(webhook, {
                        msgtype: 'text',
                        text: {
                            content: '',
                            mentioned_list,
                        },
                    });
                }
            })
            .then(() => {
                Logger.log('msg send success', 'SendTextMsg');
            })
            .catch(error => {
                Logger.error('msg send fail', error.stack, 'SendTextMsg');
                throw new Error(error);
            });
    }
}
