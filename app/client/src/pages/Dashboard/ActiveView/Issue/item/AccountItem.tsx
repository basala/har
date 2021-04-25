import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    ButtonGroup,
    Center,
    Icon,
    Tooltip,
    useColorModeValue,
} from '@chakra-ui/react';
import gql from 'graphql-tag';
import { FC } from 'react';
import { IconType } from 'react-icons';
import {
    FcEditImage,
    FcFolder,
    FcFullTrash,
    FcOpenedFolder,
    FcStart,
} from 'react-icons/fc';
import { AccountParams, default as React } from '../modal/AccountModal';

interface AccountItemProps {
    id: string;
    name: string;
    environment: AccountParams;
}

const UPDATE_ACCOUNT = gql`
    mutation updateAccount($input: UpdateAccountInput!) {
        updateAccount(input: $input) {
            id
            name
            environment {
                host
                authUrl
                authBody
                tokenPath
            }
        }
    }
`;

function createActionButton(icon: IconType, label: string) {
    return (
        <Tooltip label={label}>
            <Center borderRadius={20} boxSize={10} bg="gray.200">
                <Icon as={icon} fontSize={20} />
            </Center>
        </Tooltip>
    );
}

const AccountItem: FC<AccountItemProps> = props => {
    const bg = useColorModeValue(
        '#fff linear-gradient( 135deg, rgba(250, 215, 161, 0.3) 10%, rgba(233, 109, 133, 0.3) 100%);',
        '#1a212c'
    );

    return (
        <Accordion allowToggle>
            <AccordionItem borderWidth={1} boxShadow="md">
                {({ isExpanded }) => (
                    <>
                        <AccordionButton
                            position="sticky"
                            top="0"
                            _hover={{
                                bg: '',
                            }}
                            _focus={{
                                border: '0',
                            }}
                            zIndex="1"
                            h="4rem"
                            bg={bg}
                        >
                            <Icon
                                as={isExpanded ? FcOpenedFolder : FcFolder}
                                boxSize={8}
                                mr="1rem"
                            />
                            <Box flex="1" textAlign="left" fontWeight="bold">
                                {props.name}
                            </Box>
                            <ButtonGroup
                                onClick={event => {
                                    event.preventDefault();
                                }}
                                mr="1rem"
                            >
                                {createActionButton(FcStart, '执行')}
                                {createActionButton(FcEditImage, '编辑')}
                                {createActionButton(FcFullTrash, '删除')}
                            </ButtonGroup>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi ut aliquip
                            ex ea commodo consequat.
                        </AccordionPanel>
                    </>
                )}
            </AccordionItem>
        </Accordion>
    );
};

export default AccountItem;
