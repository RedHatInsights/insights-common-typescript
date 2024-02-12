import * as React from 'react';
import { FieldInputProps } from 'formik';

export const onChangePFAdapter = <T = React.FormEvent<HTMLInputElement>, E = boolean>(field: FieldInputProps<T>) => {
    return (_: T, e: E) => {
        return field.onChange(e);
    };
};

type HandleChangeType = ((e: boolean | React.ChangeEvent<any>, maybePath?: string) => void);

export const onChangePFAdapterCheckbox = (field: FieldInputProps<boolean>) => {
    return (value: boolean, e: React.FormEvent<HTMLInputElement>) => {
        const onChange: HandleChangeType = field.onChange;
        return onChange(value, (e.target as any).name);
    };
};
