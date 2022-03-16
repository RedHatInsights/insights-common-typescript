import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, TextArea as PFTextArea, TextAreaProps as PFTextAreaProps } from '@patternfly/react-core';

import { onChangePFAdapter } from './Common';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';
import { ouiaParams } from '../../../utils/Ouia';

interface FormTextAreaProps extends OuiaProps, Omit<PFTextAreaProps, 'id' | 'name' | 'onChange'> {
    id: string;
    name: string;
}

export const FormTextArea: React.FunctionComponent<FormTextAreaProps> = (props) => {
    const { innerRef, ...useFieldProps } = props;
    const [ field, meta ] = useField({ ...useFieldProps });
    const isValid = !meta.error || !meta.touched;

    const ouiaData = useOuia(ouiaParams('FormikPatternfly/FormTextArea'));

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...ouiaData }
        >
            <PFTextArea
                { ...withoutOuiaProps(props) }
                { ...field }
                value={ field.value || '' }
                validated={ (isValid) ? 'default' : 'error' }
                onChange={ onChangePFAdapter<string | number, React.FormEvent<HTMLTextAreaElement>>(field) }
            />
        </FormGroup>
    );
};
