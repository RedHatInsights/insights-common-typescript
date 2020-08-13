import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Switch as PFSwitch, SwitchProps as PFSwitchProps } from '@patternfly/react-core';

import { onChangePFAdapter } from './Common';
import { OuiaComponentProps, withoutOuiaProps } from '../../../utils';
import { getOuiaProps } from '../../../utils/Ouia';

interface SwitchProps extends OuiaComponentProps, Omit<PFSwitchProps, 'onChange' | 'ref' | 'ouiaSafe' | 'ouiaId'> {
    id: string;
    name: string;
    isRequired: boolean;
    labelOn?: string;
}

export const Switch: React.FunctionComponent<SwitchProps> = (props) => {
    const [ field, meta ] = useField({ ...props, type: 'checkbox' });
    const { labelOn: label, ...restProps } = props;
    const isValid = !meta.error || !meta.touched;

    return (
        <FormGroup
            fieldId={ props.id }
            helperTextInvalid={ meta.error }
            isRequired={ props.isRequired }
            validated={ (isValid) ? 'default' : 'error' }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/Switch', props) }
        >
            <div>
                <PFSwitch
                    isChecked={ field.checked  }
                    { ...withoutOuiaProps(restProps) }
                    { ...field }
                    ouiaId="pf-switch"
                    ouiaSafe={ props.ouiaSafe }
                    label={ label }
                    onChange={ onChangePFAdapter<boolean>(field) }
                />
            </div>
        </FormGroup>
    );
};
