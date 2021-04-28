import {
    Button,
    FormControl,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast,
} from '@chakra-ui/react';
import React, { FC } from 'react';

interface IssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    name: string;
    onConfirm: (name: string) => void;
}

const IssueModal: FC<IssueModalProps> = props => {
    const { isOpen, onClose, loading, onConfirm } = props;
    const [name, setName] = React.useState(props.name);
    React.useEffect(() => {
        setName(props.name);
    }, [props.name, isOpen]);

    const toast = useToast();
    const checkValid = () => {
        if (!name) {
            toast({
                description: '请先填写必填项',
                status: 'error',
                position: 'top',
            });

            return false;
        }

        return true;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>重命名</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl isRequired>
                        <InputGroup>
                            <Input
                                placeholder="i need a name"
                                defaultValue={name}
                                onChange={event => {
                                    setName(event.target.value);
                                }}
                            />
                        </InputGroup>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        取消
                    </Button>
                    <Button
                        isLoading={loading}
                        colorScheme="blue"
                        onClick={() => {
                            checkValid() && onConfirm(name);
                        }}
                    >
                        确认
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default IssueModal;
