import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FormSelect as PFFormSelect, FormSelectProps as PFFormSelectProps } from '@patternfly/react-core';

import { onChangePFAdapter } from './Common';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';
import { ouiaParams } from '../../../utils/Ouia';

interface FormSelectProps extends OuiaProps, Omit<PFFormSelectProps, 'onChange' | 'ref' | 'ouiaId'> {
    id: string;
    name: string;
    isRequired?: boolean;
}

export const FormSelect: React.FunctionComponent<FormSelectProps> = (props) => {
    const [ field, meta ] = useField({ ...props });
    const isValid = !meta.error || !meta.touched;

    const ouiaData = useOuia(ouiaParams('FormikPatternfly/FormSelect'));

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...ouiaData }
        >
            <PFFormSelect
                { ...withoutOuiaProps(props) }
                { ...field }
                onChange={ onChangePFAdapter<string | number, React.FormEvent<HTMLSelectElement>>(field) }
                validated={ (isValid) ? 'default' : 'error' }
            >
                { props.children }
            </PFFormSelect>
        </FormGroup>
    );
};
