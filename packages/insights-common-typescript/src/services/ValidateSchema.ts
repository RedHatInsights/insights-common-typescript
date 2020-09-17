import { Action, QueryResponse, ResponseInterceptor } from 'react-fetching-library';
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

export interface ActionValidatable {
    rules: Array<ValidateRule>;
}

type ActionWithRequiredConfig =
    Required<Pick<Action<any, ActionValidatable>, 'config'>>
    & Omit<Action<any, ActionValidatable>, 'config'>;

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

export const validateSchema =
    <Status extends number | undefined, Type extends any | unknown>(
        action: ActionWithRequiredConfig,
        response: QueryResponse<unknown>
    ) => {
        const errors: Record<number, z.ZodError> = {};
        const rules = action.config.rules;
        for (const rule of rules) {
            if (rule.status === response.status) {
                const result = rule.zod.safeParse(response.payload);
                if (result.success) {
                    return validatedResponse(
                        rule.type,
                        rule.status,
                        result.data,
                        errors
                    );
                }

                errors[rule.status] = result.error;
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            const request = `${action.method.toUpperCase()}: ${action.endpoint} with body: ${action.body}`;
            console.error(`All validations failed for request ${request}`);
        }

        return validatedResponse(
            'undefined',
            undefined,
            response.payload,
            errors
        );
    };

export const validateSchemaResponseInterceptor: ResponseInterceptor<any, any> = _client => async (action, response) => {
    if (action.config.rules) {
        const r = validateSchema(action as ActionWithRequiredConfig, response);
        response.payload = r;
        return response;
    }

    return response;
};
