import * as React from 'react';
import { useField } from 'formik';
import { Switch as PFSwitch, SwitchProps as PFSwitchProps } from '@patternfly/react-core/dist/dynamic/components/Switch';
import { FormGroup, FormHelperText } from '@patternfly/react-core/dist/dynamic/components/Form';
import { HelperText, HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';

import { onChangePFAdapter } from './Common';
import { OuiaComponentProps, withoutOuiaProps } from '../../../utils';
import { getOuiaProps } from '../../../utils/Ouia';

interface SwitchProps extends OuiaComponentProps, Omit<PFSwitchProps, 'onChange' | 'ref' | 'ouiaSafe' | 'ouiaId'> {
    id: string;
    name: string;
    isRequired?: boolean;
    labelOn?: string;
}

export const Switch: React.FunctionComponent<SwitchProps> = (props) => {
    const [ field, meta ] = useField({ ...props, type: 'checkbox' });
    const { labelOn: label, ...restProps } = props;

    return (
        <FormGroup
            fieldId={ props.id }
            isRequired={ props.isRequired }
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
                    onChange={ onChangePFAdapter<React.FormEvent<HTMLInputElement>>(field) }
                />
                {meta.error && <FormHelperText>
                    <HelperText>
                        <HelperTextItem>{ meta.error }</HelperTextItem>
                    </HelperText>
                </FormHelperText>
                }
            </div>
        </FormGroup>
    );
};
