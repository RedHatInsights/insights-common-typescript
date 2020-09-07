import { DeepReadonly } from 'ts-essentials';

export const localUrl = (path: string, isBeta: boolean): string => {
    if (isBeta) {
        return `/beta${path}`;
    }

    return path;
};

const InternalConfig = {
    pages: {
        emailPreferences: (isBeta: boolean): string => localUrl('/user-preferences/email', isBeta)
    }
};

export const Config: DeepReadonly<typeof InternalConfig> = InternalConfig;
