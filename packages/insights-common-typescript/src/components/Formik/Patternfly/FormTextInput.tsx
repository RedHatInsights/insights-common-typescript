import * as React from 'react';
import { useField } from 'formik';
import { Text, TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextInput as PFTextInput, TextInputProps } from '@patternfly/react-core/dist/dynamic/components/TextInput';
import { FormGroup, FormHelperText } from '@patternfly/react-core/dist/dynamic/components/Form';
import { HelperText, HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';

import { onChangePFAdapter } from './Common';
import { withoutOuiaProps } from '../../../utils';
import { getOuiaProps } from '../../../utils/Ouia';

interface FormTextInputProps extends Omit<TextInputProps, 'onChange' | 'innerRef' | 'ouiaId'> {
    id: string;
    name: string;
    hint?: string;
    ouiaId?: string;
}

export const FormTextInput: React.FunctionComponent<FormTextInputProps> = (props) => {
    const { hint, ...otherProps } = props;
    const [ field, meta ] = useField({ ...otherProps });
    const isValid = !meta.error || !meta.touched;

    return (
        <FormGroup
            fieldId={ props.id }
            isRequired={ props.isRequired }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/FormTextInput', props) }
        >
            <PFTextInput
                { ...withoutOuiaProps(otherProps) }
                { ...field }
                validated={ (isValid) ? 'default' : 'error' }
                value={ field.value !== undefined ? field.value.toString() : '' }
                onChange={ onChangePFAdapter<React.FormEvent<HTMLInputElement>>(field) }
            />
            { hint && <Text component={ TextVariants.small }>{ hint }</Text> }
            {meta.error && <FormHelperText>
                <HelperText>
                    <HelperTextItem>{ meta.error }</HelperTextItem>
                </HelperText>
            </FormHelperText>
            }
        </FormGroup>
    );
};
