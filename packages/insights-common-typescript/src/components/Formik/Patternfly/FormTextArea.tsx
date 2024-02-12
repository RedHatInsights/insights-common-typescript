import * as React from 'react';
import { useField } from 'formik';
import { TextArea as PFTextArea, TextAreaProps as PFTextAreaProps } from '@patternfly/react-core/dist/dynamic/components/TextArea';
import { FormGroup, FormHelperText } from '@patternfly/react-core/dist/dynamic/components/Form';
import { HelperText, HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';

import { onChangePFAdapter } from './Common';
import { OuiaComponentProps, withoutOuiaProps } from '../../../utils';
import { getOuiaProps } from '../../../utils/Ouia';

interface FormTextAreaProps extends OuiaComponentProps, Omit<PFTextAreaProps, 'id' | 'name' | 'onChange'> {
    id: string;
    name: string;
}

export const FormTextArea: React.FunctionComponent<FormTextAreaProps> = (props) => {
    const { innerRef, ...useFieldProps } = props;
    const [ field, meta ] = useField({ ...useFieldProps });
    const isValid = !meta.error || !meta.touched;

    return (
        <FormGroup
            fieldId={ props.id }
            isRequired={ props.isRequired }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/FormTextArea', props) }
        >
            <PFTextArea
                { ...withoutOuiaProps(props) }
                { ...field }
                value={ field.value || '' }
                validated={ (isValid) ? 'default' : 'error' }
                isRequired={ props.isRequired }
                onChange={ onChangePFAdapter<React.FormEvent<HTMLTextAreaElement>, string | number>(field) }
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
