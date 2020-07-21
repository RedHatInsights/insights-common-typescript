// This type was fetched by manual inspection and is incomplete.
// Check in your browser the `insights` global for more information.
// Is possible that there is something wrong and/or missing, but as I was using this on more than one file it seems like
// a good idea to have all the usage in a single file and define a common interface to keep track of it.
// It would be even better to add the typings to the common code or to @types.
import jestMock from 'jest-mock';

interface Entitlement {
    is_entitled: boolean;
}

interface UserData {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_org_admin: boolean;
    is_internal: boolean;
    locale: string;
}

interface Internal {
    org_id: string;
    account_id: number;
}

interface Identity {
    account_number: string;
    type: string;
    user: UserData;
    internal: Internal;
}

interface User {
    identity: Identity;
    entitlements: Record<string, Entitlement>;
}

export type InsightsType = {
    chrome: {
        init: () => void;
        identifyApp: (appId: string) => Promise<void>;
        on: (type: string, callback: ((event: any) => void)) => void;
        auth: {
            getUser: () => Promise<User>;
        };
        isProd: boolean;
        isBeta: () => boolean;
    };
};

interface Window {
    insights: InsightsType;
}

declare const window: Window;

let insightPromise: Promise<InsightsType>;

export const waitForInsights = (): Promise<InsightsType> => {
    if (!insightPromise) {
        insightPromise = new Promise<InsightsType>(async (resolve) => {
            while (!window.hasOwnProperty('insights')) {
                await new Promise(timeout => setTimeout(timeout, 250));
            }

            resolve(window.insights);
        });
    }

    return insightPromise;
};

export const getInsights = (): InsightsType => window.insights;

export const mockInsights = (mock?: InsightsType) => {
    window.insights = mock || {
        chrome: {
            init: jestMock.fn(),
            identifyApp: jestMock.fn((_appId: string) => Promise.resolve()),
            on: jestMock.fn((type: string, callback: ((event: any) => void)) => {
                callback(new Event('fake'));
            }),
            isProd: false,
            isBeta: jestMock.fn(() => true),
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
