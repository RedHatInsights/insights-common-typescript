import jestMock from 'jest-mock';
import { InsightsType } from '@redhat-cloud-services/insights-common-typescript';

interface Window {
    insights: InsightsType;
}

declare const window: Window;

export const mockInsights = (mock?: InsightsType) => {
    window.insights = mock || {
        chrome: {
            init: jestMock.fn(),
            identifyApp: jestMock.fn((_appId: string) => Promise.resolve()),
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
                            account_id: 1800
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
                            is_entitled: true
                        },
                        cost_management: {
                            is_entitled: true
                        },
                        insights: {
                            is_entitled: true
                        },
                        migrations: {
                            is_entitled: false
                        },
                        openshift: {
                            is_entitled: true
                        },
                        settings: {
                            is_entitled: true
                        },
                        smart_management: {
                            is_entitled: true
                        },
                        subscriptions: {
                            is_entitled: true
                        }
                    }
                }))
            }
        }
    };
};
