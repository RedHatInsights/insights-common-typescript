import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FormHelperText } from '@patternfly/react-core/dist/dynamic/components/Form';
import { HelperText, HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { FormSelect as PFFormSelect, FormSelectProps as PFFormSelectProps } from '@patternfly/react-core/dist/dynamic/components/FormSelect';

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
            label={ props.label }
            isRequired={ props.isRequired }
            { ...getOuiaProps('FormikPatternfly/FormSelect', props) }
        >
            <PFFormSelect
                { ...withoutOuiaProps(props) }
                { ...field }
                onChange={ onChangePFAdapter<React.FormEvent<HTMLSelectElement>, string | number>(field) }
                isRequired={ props.isRequired }
                validated={ (isValid) ? 'default' : 'error' }
            >
                { props.children }
            </PFFormSelect>
            {meta.error && <FormHelperText>
                <HelperText>
                    <HelperTextItem>{ meta.error }</HelperTextItem>
                </HelperText>
            </FormHelperText>
            }
        </FormGroup>
    );
};
