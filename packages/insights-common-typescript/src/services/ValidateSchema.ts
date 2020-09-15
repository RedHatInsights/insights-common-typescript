import { QueryResponse, ResponseInterceptor } from 'react-fetching-library';
import * as z from 'zod';

export interface ValidatedResponse<Type extends string, Status extends number | undefined, ValueType> {
    type: Type,
    status: Status;
    value: ValueType;
    errors: Array<z.ZodError>;
}

export interface ValidateRule {
    zod: z.ZodTypeAny;
    type: string;
    status: number;
}

export interface ActionValidatable {
    rules: Array<ValidateRule>;
}

export const validateSchema =
    <Status extends number | undefined, Type extends any | unknown>(
        rules: Array<ValidateRule>,
        response: QueryResponse<unknown>
    ) => {
        const errors: Array<z.ZodError> = [];
        for (const rule of rules) {
            if (rule.status === response.status) {
                console.log('running validation for rule', rule);
                const result = rule.zod.safeParse(response.payload);
                if (result.success) {
                    return {
                        type: rule.type,
                        status: rule.status,
                        value: result.data,
                        errors
                    };
                }

                console.log('pushing error', result.error);
                errors.push(result.error);
            }
        }

        return {
            type: undefined,
            status: undefined,
            value: response.payload,
            errors
        };
    };

export const responseInterceptor: ResponseInterceptor<any, any> = _client => async (action, response) => {
    if (action.config.rules) {
        console.log('Running validation');
        const r = validateSchema(action.config.rules, response);
        console.log('result', r);
        response.payload = r;
        return response;
    }

    return response;
};
