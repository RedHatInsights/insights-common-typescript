import jestMock from 'jest-mock';
import { ChromeAPI } from '@redhat-cloud-services/types';
import { DeepPartial } from 'ts-essentials';

interface Window {
    insights: {
        chrome: DeepPartial<ChromeAPI>
    };
}

declare const window: Window;

export const mockInsights = (mock?: DeepPartial<ChromeAPI>) => {
    const mockedChrome: DeepPartial<ChromeAPI> = mock ?? {
        initialized: true,
        init: jestMock.fn(),
        identifyApp: jestMock.fn((_appId: string) => Promise.resolve() as Promise<undefined>),
        on: jestMock.fn(),
        getApp: jestMock.fn(() => 'my-app'),
        getBundle: jestMock.fn(() => 'my-bundle'),
        isPenTest: jestMock.fn(() => false),
        isProd: false,
        isBeta: jestMock.fn(() => true),
        getEnvironment: jestMock.fn(() => 'ci'),
        auth: {
            getUser: jestMock.fn(() => Promise.resolve({
                identity: {
                    account_number: '123456',
                    internal: {
                        org_id: '78900',
                        account_id: '1800'
                    },
                    type: 'User',
                    user: {
                        email: 'some-user@some-email.com',
                        first_name: 'First name',
                        is_active: true,
                        is_internal: true,
                        is_org_admin: false,
                        last_name: 'Last',
                        locale: 'en_US',
                        username: 'flast'
                    }
                },
                entitlements: {
                    ansible: {
                        is_entitled: true,
                        is_trial: false
                    },
                    cost_management: {
                        is_entitled: true,
                        is_trial: false
                    },
                    insights: {
                        is_entitled: true,
                        is_trial: false
                    },
                    migrations: {
                        is_entitled: false,
                        is_trial: false
                    },
                    openshift: {
                        is_entitled: true,
                        is_trial: false
                    },
                    settings: {
                        is_entitled: true,
                        is_trial: false
                    },
                    smart_management: {
                        is_entitled: true,
                        is_trial: false
                    },
                    subscriptions: {
                        is_entitled: true,
                        is_trial: false
                    }
                }
            }))
        }
    };

    window.insights = {
        chrome: mockedChrome
    };
};
