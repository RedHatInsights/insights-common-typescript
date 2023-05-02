import { DeepReadonly } from 'ts-essentials';

export const localUrl = (path: string, isBeta: boolean): string => {
    if (isBeta) {
        return `/preview${path}`;
    }

    return path;
};

const InternalConfig = {
    pages: {
        emailPreferences: (isBeta: boolean, bundle: string): string => localUrl(`/user-preferences/notification/${bundle}`, isBeta),
        notificationSettings: (isBeta: boolean, bundle: string): string => localUrl(`/settings/notifications/${bundle}`, isBeta)
    }
};

export const Config: DeepReadonly<typeof InternalConfig> = InternalConfig;
