import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Text, TextVariants, TextProps } from '@patternfly/react-core';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';
import { ouiaParams } from '../../../utils/Ouia';

interface FormTextProps extends OuiaProps, Omit<TextProps, 'ref'> {
    id: string;
    name: string;
    isRequired?: boolean;
}

export const FormText: React.FunctionComponent<FormTextProps> = (props) => {
    const [ field, meta ] = useField({ ...props });
    const isValid = !meta.error || !meta.touched;

    const ouiaData = useOuia(ouiaParams('FormikPatternfly/FormText'));

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...ouiaData }
        >
            <Text component={ TextVariants.p }
                { ...withoutOuiaProps(props) }
                { ...field }
            >
                { field.value || '' }
            </Text>
        </FormGroup>
    );
};
