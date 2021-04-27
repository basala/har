import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Code,
    HStack,
    Icon,
    IconButton,
    Text,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';
import { Method } from 'axios';
import React, { FC } from 'react';
import { FcEditImage, FcFullTrash, FcStart, FcVideoFile } from 'react-icons/fc';
import IssueModal from './IssueModal';

export interface Issue {
    id: string;
    name: string;
    url: string;
    method: Method;
}

interface IssueItemProps {
    issue: Issue;
}

const IssueItem: FC<IssueItemProps> = props => {
    const {
        issue: { name, url, method },
    } = props;
    const { pathname } = new URL(url);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteTipOpen,
        onOpen: onDeleteTipOpen,
        onClose: onDeleteTipClose,
    } = useDisclosure();
    const cancelRef = React.useRef(null);

    return (
        <HStack
            p={2}
            pl={4}
            spacing={2}
            h="4rem"
            borderWidth={1}
            boxShadow="md"
            borderTopLeftRadius="4rem"
            borderBottomLeftRadius="4rem"
        >
            <Icon as={FcVideoFile} fontSize={25} />
            <Box w="3rem">
                <Badge colorScheme="pink">{method}</Badge>
            </Box>
            <Text
                w="1rem"
                flex="1"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
            >
                {name}
            </Text>
            <Tooltip label={pathname}>
                <Code
                    px={2}
                    w="20rem"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    {pathname}
                </Code>
            </Tooltip>
            <ButtonGroup w="10rem">
                <IconButton
                    aria-label="run"
                    isRound
                    fontSize={20}
                    icon={<FcStart />}
                />
                <IconButton
                    aria-label="run"
                    isRound
                    fontSize={20}
                    icon={<FcEditImage />}
                    onClick={onOpen}
                />
                <IssueModal
                    isOpen={isOpen}
                    loading={true}
                    onClose={onClose}
                    onConfirm={name => {
                        console.log(name);
                    }}
                    name={name}
                />
                <IconButton
                    aria-label="run"
                    isRound
                    fontSize={20}
                    onClick={onDeleteTipOpen}
                    icon={<FcFullTrash />}
                />
                <AlertDialog
                    leastDestructiveRef={cancelRef}
                    onClose={onDeleteTipClose}
                    isOpen={isDeleteTipOpen}
                >
                    <AlertDialogOverlay />
                    <AlertDialogContent>
                        <AlertDialogHeader>w(ﾟДﾟ)w</AlertDialogHeader>
                        <AlertDialogCloseButton />
                        <AlertDialogBody>{`删除后无法恢复噢，确定删除该用例吗`}</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteTipClose}>
                                取消
                            </Button>
                            <Button
                                isLoading={true}
                                colorScheme="red"
                                ml={3}
                                // onClick={onDelete}
                            >
                                确认
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </ButtonGroup>
        </HStack>
    );
};

export default IssueItem;
