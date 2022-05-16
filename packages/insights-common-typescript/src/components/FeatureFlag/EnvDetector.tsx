import * as React from 'react';
import { RenderIf } from './RenderIf';
import { Environment } from '../../types';
import { ChromeAPI } from '@redhat-cloud-services/types';

interface EnvDetectorProps {
    onEnvironment: ReadonlyArray<Environment> | Environment;
    currentEnvironment: string;
}

export const EnvDetector: React.FunctionComponent<EnvDetectorProps> = (props) => {
    const environment = React.useMemo(
        () => Array.isArray(props.onEnvironment) ? props.onEnvironment : [ props.onEnvironment ],
        [ props.onEnvironment ]
    );

    const renderIf = React.useCallback(
        () => environment.includes(props.currentEnvironment),
        [ props.currentEnvironment, environment ]
    );

    return <RenderIf renderIf={ renderIf }>
        { props.children }
    </RenderIf>;
};

interface InsightsBetaDetectorProps extends Omit<EnvDetectorProps, 'currentEnvironment'> {
    chrome: ChromeAPI;
}

export const InsightsEnvDetector: React.FunctionComponent<InsightsBetaDetectorProps> = (props) => {
    const currentEnvironment: string = React.useMemo(() => {
        const isBeta = props.chrome.isBeta();
        const env = props.chrome.getEnvironment();
        if (isBeta) {
            return `${env}-beta`;
        } else {
            return env;
        }
    }, [ props.chrome ]);

    return <EnvDetector onEnvironment={ props.onEnvironment } currentEnvironment={ currentEnvironment }>{ props.children }</EnvDetector>;
};
