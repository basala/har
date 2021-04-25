import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from '@chakra-ui/react';
import React, { FC } from 'react';

interface IssueUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const IssueUploadModal: FC<IssueUploadModalProps> = props => {
    const { isOpen, onClose, onConfirm } = props;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader></ModalHeader>
                <ModalCloseButton />
                <ModalBody></ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        取消
                    </Button>
                    <Button colorScheme="blue" onClick={onConfirm}>
                        确认
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default IssueUploadModal;
