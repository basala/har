import { Divider, Flex, Grid, Text } from '@chakra-ui/layout';
import { FC } from 'react';

const IssueView: FC = () => {
    return (
        <Flex direction="column" h="100%">
            <Text>issue</Text>
            <Divider />
            <Grid flex="1"></Grid>
        </Flex>
    );
};

export default IssueView;
