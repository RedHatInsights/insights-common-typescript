import * as React from 'react';
import { useField } from 'formik';
import { Checkbox as PFCheckbox, FormGroup, CheckboxProps as PFCheckboxProps } from '@patternfly/react-core';

import { onChangePFAdapter } from './Common';
import { ouiaParams } from '../../../utils/Ouia';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';

interface CheckboxProps extends OuiaProps, Omit<PFCheckboxProps, 'onChange' | 'ref'> {
    name: string;
    isRequired?: boolean;
}

export const Checkbox: React.FunctionComponent<CheckboxProps> = (props) => {
    const [ field, meta ] = useField({ ...props, type: 'checkbox' });
    const isValid = !meta.error || !meta.touched;

    const ouiaData = useOuia(ouiaParams('FormikPatternfly/Checkbox'));

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            { ...ouiaData }
        >
            <PFCheckbox
                isChecked={ field.checked  }
                { ...withoutOuiaProps(props) }
                { ...field }
                isValid={ isValid }
                onChange={ onChangePFAdapter<boolean>(field) }
            />
        </FormGroup>
    );
};
