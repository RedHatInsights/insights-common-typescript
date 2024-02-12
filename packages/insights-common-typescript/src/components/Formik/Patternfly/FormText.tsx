import * as React from 'react';
import { useField } from 'formik';
import { Text, TextVariants, TextProps } from '@patternfly/react-core/dist/dynamic/components/Text';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import { getOuiaProps, withoutOuiaProps } from '../../../utils/Ouia';

interface FormTextProps extends Omit<TextProps, 'ref' | 'ouiaId'> {
    id: string;
    name: string;
    isRequired?: boolean;
    ouiaId?: string;
}

export const FormText: React.FunctionComponent<FormTextProps> = (props) => {
    const [ field ] = useField({ ...props });

    return (
        <FormGroup
            fieldId={ props.id }
            label={ props.label }
            { ...getOuiaProps('FormikPatternfly/FormText', props) }
        >
            <Text component={ TextVariants.p }
                { ...withoutOuiaProps(props) }
                { ...field }
            >
                { field.value || '' }
            </Text>
        </FormGroup>
    );
};
