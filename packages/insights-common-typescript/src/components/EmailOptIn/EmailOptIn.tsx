import * as React from 'react';
import { Text, TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Alert, AlertVariant } from '@patternfly/react-core/dist/dynamic/components/Alert';

import { Messages } from '../../properties/Messages';
import { Config } from '../../config';
import { InsightsType, OuiaComponentProps } from '../../utils';
import { getOuiaProps } from '../../utils/Ouia';
import { format } from 'react-string-format';

interface EmailOptInProps extends OuiaComponentProps {
    content: string;
    isBeta: boolean;
    bundle: string;
}

export const EmailOptIn: React.FunctionComponent<EmailOptInProps> = (props) => {
    const emailUrl = React.useMemo(() => Config.pages.emailPreferences(props.isBeta, props.bundle), [ props.bundle, props.isBeta ]);
    const content = React.useMemo(() => {
        return format(props.content, <a href={ Config.pages.notificationSettings(props.isBeta, props.bundle) }>notification settings</a>);
    }, [ props.content, props.bundle, props.isBeta ]);

    return (
        <div { ...getOuiaProps('EmailOptin', props) }>
            <Alert
                title={ Messages.components.emailOptIn.title }
                variant={ AlertVariant.warning }
                isInline={ true }
            >
                <TextContent>
                    <Text>{ content }</Text>
                    <Text>
                        <a href={ emailUrl } target='_blank' rel='noopener noreferrer' >{ Messages.components.emailOptIn.link }</a>
                    </Text>
                </TextContent>
            </Alert>
        </div>
    );
};

type Partials = 'isBeta' | 'bundle';
type InsightsEmailOptInPropsType = Partial<Pick<EmailOptInProps, Partials>> & Omit<EmailOptInProps, Partials>;

interface InsightsEmailOptInProps extends InsightsEmailOptInPropsType {
    insights: InsightsType;
}

export const InsightsEmailOptIn: React.FunctionComponent<InsightsEmailOptInProps> = (props) =>
    <EmailOptIn
        { ...props }
        isBeta={ props.isBeta ?? props.insights.chrome.isBeta() }
        bundle={ props.bundle ?? props.insights.chrome.getBundle() }
    />;
