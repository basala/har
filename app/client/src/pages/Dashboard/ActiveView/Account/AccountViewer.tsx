import { gql, useQuery } from '@apollo/client';
import { Box, VStack } from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcHighPriority } from 'react-icons/fc';
import EmptyPane from '../../../../components/Exception/EmptyPane';
import CatLoading from '../../../../components/Loading/CatLoading';
import { useUrlPath } from '../../../../hooks/url';
import AccountItem from './AccountItem';
import { AccountParams } from './modal/AccountModal';

interface AccountViewerProps {
    isAdding: boolean;
    setAdding: React.Dispatch<React.SetStateAction<boolean>>;
}

const QUERY_ACCOUNT = gql`
    query account($input: String!) {
        findAllAccounts(input: $input) {
            id
            name
            updateAt
            environment {
                username
                password
            }
        }
    }
`;

const AccountViewer: FC<AccountViewerProps> = props => {
    const [, projectId] = useUrlPath();
    const endRef = React.useRef<HTMLDivElement>(null);
    const { loading, error, data } = useQuery<
        {
            findAllAccounts: {
                id: string;
                name: string;
                environment: AccountParams;
            }[];
        },
        {
            input: string;
        }
    >(QUERY_ACCOUNT, {
        variables: {
            input: projectId,
        },
    });
    React.useEffect(() => {
        if (props.isAdding) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
            props.setAdding(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (loading) {
        return <CatLoading size="lg" />;
    }

    if (error) {
        return (
            <EmptyPane
                icon={FcHighPriority}
                text="哎呀好像出错了呢Σ( ° △ °|||)︴"
            />
        );
    }

    if (_.isEmpty(data?.findAllAccounts)) {
        return <EmptyPane icon={FcExpired} text="貌似什么都没有噢ヽ(✿ﾟ▽ﾟ)ノ" />;
    }

    return (
        <VStack spacing={1}>
            {_.map(
                _.orderBy(data?.findAllAccounts, 'updateAt', 'desc'),
                (account, index) => {
                    const { id, name, environment } = account;

                    return (
                        <Box w="100%" px={4} py={2} key={index}>
                            <AccountItem
                                id={id}
                                name={name}
                                environment={environment}
                            />
                        </Box>
                    );
                }
            )}
            <div ref={endRef} />
        </VStack>
    );
};

export default AccountViewer;
