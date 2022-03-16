import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Text, TextInput as PFTextInput, TextInputProps, TextVariants } from '@patternfly/react-core';

import { onChangePFAdapter } from './Common';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';
import { ouiaParams } from '../../../utils/Ouia';

interface FormTextInputProps extends OuiaProps, Omit<TextInputProps, 'onChange' | 'innerRef'> {
    id: string;
    name: string;
    hint?: string;
}

export const FormTextInput: React.FunctionComponent<FormTextInputProps> = (props) => {
    const { hint, ...otherProps } = props;
    const [ field, meta ] = useField({ ...otherProps });
    const isValid = !meta.error || !meta.touched;

    const ouiaData = useOuia(ouiaParams('FormikPatternfly/FormTextInput'));

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...ouiaData }
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
