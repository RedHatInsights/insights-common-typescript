import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Text, TextInput as PFTextInput, TextInputProps, TextVariants } from '@patternfly/react-core';

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
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/FormTextInput', props) }
        >
            <PFTextInput
                { ...withoutOuiaProps(otherProps) }
                { ...field }
                value={ field.value !== undefined ? field.value.toString() : '' }
                validated={ (isValid) ? 'default' : 'error' }
                onChange={ onChangePFAdapter<string | number>(field) }
            />
            { hint && <Text component={ TextVariants.small }>{ hint }</Text> }
        </FormGroup>
    );
};
