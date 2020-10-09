import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FormSelect as PFFormSelect, FormSelectProps as PFFormSelectProps } from '@patternfly/react-core';

import { onChangePFAdapter } from './Common';
import { OuiaComponentProps } from '../../../utils';
import { getOuiaProps, withoutOuiaProps } from '../../../utils/Ouia';

interface FormSelectProps extends OuiaComponentProps, Omit<PFFormSelectProps, 'onChange' | 'ref' | 'ouiaId'> {
    id: string;
    name: string;
    isRequired?: boolean;
}

export const FormSelect: React.FunctionComponent<FormSelectProps> = (props) => {
    const [ field, meta ] = useField({ ...props });
    const isValid = !meta.error || !meta.touched;

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/FormSelect', props) }
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
