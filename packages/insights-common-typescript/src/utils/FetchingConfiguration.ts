import { createClient, RequestInterceptor, ResponseInterceptor } from 'react-fetching-library';
import { InsightsType } from './Insights';

const getRefreshAuthTokenInterceptor = (getInsights: () => InsightsType): RequestInterceptor => (_client) => (action) => {
    return getInsights().chrome.auth.getUser()
    .then(() => action);
};

interface FetchingClientOptions {
    requestInterceptors?: Array<RequestInterceptor>;
    responseInterceptors?: Array<ResponseInterceptor>;
}

export const createFetchingClient = (getInsights: () => InsightsType, options?: FetchingClientOptions) => createClient({
    requestInterceptors: [
        getRefreshAuthTokenInterceptor(getInsights),
        ...(options?.requestInterceptors ?? [])
    ],
    responseInterceptors: [
        ...(options?.responseInterceptors ?? [])
    ]
});
