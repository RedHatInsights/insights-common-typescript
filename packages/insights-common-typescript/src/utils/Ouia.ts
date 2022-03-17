import { UseOuiaParams } from '@redhat-cloud-services/frontend-components';

// Used internally
export const ouiaParams = (type: string): UseOuiaParams => ({
    module: 'insights-common-typescript',
    type
});
