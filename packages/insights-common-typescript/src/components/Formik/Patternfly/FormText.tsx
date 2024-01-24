import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Text, TextVariants, TextProps } from '@patternfly/react-core';
import { getOuiaProps, withoutOuiaProps } from '../../../utils/Ouia';

interface FormTextProps extends Omit<TextProps, 'ref' | 'ouiaId'> {
    id: string;
    name: string;
    isRequired?: boolean;
    ouiaId?: string;
}

export const FormText: React.FunctionComponent<FormTextProps> = (props) => {
    const [ field, meta ] = useField({ ...props });
    const isValid = !meta.error || !meta.touched;

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/FormText', props) }
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
