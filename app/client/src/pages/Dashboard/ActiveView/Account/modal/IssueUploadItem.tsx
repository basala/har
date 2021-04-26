import {
    Badge,
    Checkbox,
    Editable,
    EditableInput,
    EditablePreview,
    HStack,
    Icon,
    Tooltip,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { FcVideoFile } from 'react-icons/fc';
import { HarResult } from './IssueUploadModal';

interface IssueUploadItemProps
    extends Pick<HarResult, 'name' | 'url' | 'method'> {
    onChange: (selcted: boolean) => void;
    onNameChange: (name: string) => void;
    selected: boolean;
}

const IssueUploadItem: FC<IssueUploadItemProps> = props => {
    const [isChecked, setChecked] = React.useState(props.selected);
    React.useEffect(() => {
        setChecked(props.selected);
    }, [props.selected]);

    return (
        <HStack p={2}>
            <Checkbox
                isChecked={isChecked}
                onChange={event => {
                    props.onChange(event.target.checked);
                    setChecked(event.target.checked);
                }}
            />
            <Icon as={FcVideoFile} fontSize={25} />
            <Badge colorScheme="pink">{props.method}</Badge>
            <Editable
                defaultValue={props.name}
                whiteSpace="nowrap"
                flex="1"
                onSubmit={props.onNameChange}
            >
                <Tooltip label={props.url}>
                    <EditablePreview />
                </Tooltip>
                <EditableInput />
            </Editable>
        </HStack>
    );
};

export default IssueUploadItem;
