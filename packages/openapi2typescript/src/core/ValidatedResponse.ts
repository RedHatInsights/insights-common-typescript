import * as z from 'zod';

export interface ValidatedResponse<Type extends string, Status extends number | undefined, ValueType> {
    type: Type,
    status: Status;
    value: ValueType;
    errors: Record<number, z.ZodError>;
}

export interface ValidateRule {
    zod: z.ZodTypeAny;
    type: string;
    status: number;
}

export const validatedResponse = <
    Name extends string,
    Status extends number | undefined,
    Value
    >(name: Name, status: Status, value: Value, errors: Record<number, z.ZodError>): ValidatedResponse<Name, Status, Value> => ({
        type: name,
        status,
        value,
        errors
    });

export const validationResponseTransformer = <
    I extends any,
    M extends ValidatedResponse<string, number | undefined, unknown>
    >(x: (response: I) => M) => x;
