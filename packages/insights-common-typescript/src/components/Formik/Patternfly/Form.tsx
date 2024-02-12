import * as React from 'react';
import { Form as PFForm, FormProps as PFFormProps } from '@patternfly/react-core/dist/dynamic/components/Form';
import { OuiaComponentProps } from '../../../utils';
import { getOuiaProps, withoutOuiaProps } from '../../../utils/Ouia';

const preventDefaultHandler = (e: React.FormEvent) => e.preventDefault();

interface FormProps extends OuiaComponentProps, PFFormProps {

}

export const Form: React.FunctionComponent<FormProps> = (props) => {

    return (
        <PFForm onSubmit={ preventDefaultHandler } { ...withoutOuiaProps(props) }  { ...getOuiaProps('FormikPatternfly/Form', props) } >
            { props.children }
        </PFForm>
    );
};
