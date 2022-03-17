import * as React from 'react';
import { Form as PFForm, FormProps as PFFormProps } from '@patternfly/react-core';
import { ouiaParams } from '../../../utils/Ouia';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';

const preventDefaultHandler = (e: React.FormEvent) => e.preventDefault();

interface FormProps extends OuiaProps, PFFormProps {

}

export const Form: React.FunctionComponent<FormProps> = (props) => {

    const ouiaData = useOuia(ouiaParams('FormikPatternfly/Form'));

    return (
        <PFForm onSubmit={ preventDefaultHandler } { ...withoutOuiaProps(props) }  { ...ouiaData } >
            { props.children }
        </PFForm>
    );
};
