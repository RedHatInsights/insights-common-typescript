import * as React from 'react';
import { useField } from 'formik';
import { Checkbox as PFCheckbox, CheckboxProps as PFCheckboxProps } from '@patternfly/react-core/dist/dynamic/components/Checkbox';
import { FormGroup, FormHelperText } from '@patternfly/react-core/dist/dynamic/components/Form';
import { HelperText, HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';

import { onChangePFAdapter } from './Common';
import { getOuiaProps, withoutOuiaProps } from '../../../utils/Ouia';

interface CheckboxProps extends Omit<PFCheckboxProps, 'onChange' | 'ref' | 'ouiaId'> {
    name: string;
    isRequired?: boolean;
    ouiaId?: string;
}

export const Checkbox: React.FunctionComponent<CheckboxProps> = (props) => {
    const [ field, meta ] = useField({ ...props, type: 'checkbox' });
    const isValid = !meta.error || !meta.touched;

    return (
        <FormGroup
            fieldId={ props.id }
            isRequired={ props.isRequired }
            { ...getOuiaProps('FormikPatternfly/Checkbox', props) }
        >
            <PFCheckbox
                isChecked={ field.checked  }
                { ...withoutOuiaProps(props) }
                { ...field }
                isValid={ isValid }
                isRequired={ props.isRequired }
                onChange={ onChangePFAdapter(field) }
            />
            {meta.error && <FormHelperText>
                <HelperText>
                    <HelperTextItem>{ meta.error }</HelperTextItem>
                </HelperText>
            </FormHelperText>
            }
        </FormGroup>
    );
};
