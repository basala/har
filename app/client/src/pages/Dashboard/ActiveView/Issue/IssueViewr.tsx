import { gql, useQuery } from '@apollo/client';
import { Text, VStack } from '@chakra-ui/react';
import _ from 'lodash';
import React, { FC } from 'react';
import { FcExpired, FcHighPriority } from 'react-icons/fc';
import EmptyPane from '../../../../components/Exception/EmptyPane';
import CatLoading from '../../../../components/Loading/CatLoading';
import { CreateAccountInput } from './IssueContainer';

interface IssueViewerProps {
    projectId: string;
    isAdding: boolean;
    setAdding: React.Dispatch<React.SetStateAction<boolean>>;
}

const QUERY_ACCOUNT = gql`
    query account($input: String!) {
        findAllAccounts(input: $input) {
            id
            name
            environment {
                username
                password
            }
        }
    }
`;

const IssueViewer: FC<IssueViewerProps> = props => {
    const endRef = React.useRef<HTMLDivElement>(null);
    const { loading, error, data } = useQuery<{
        findAllAccounts: ({
            id: string;
        } & CreateAccountInput)[];
    }>(QUERY_ACCOUNT, {
        variables: {
            input: props.projectId,
        },
    });
    React.useEffect(() => {
        if (props.isAdding) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
            props.setAdding(false);
        }
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
        <VStack spacing={6}>
            {_.map(data?.findAllAccounts, (account, index) => {
                return <Text key={index}>{account.name}</Text>;
            })}
            <div ref={endRef} />
        </VStack>
    );
};

export default IssueViewer;
