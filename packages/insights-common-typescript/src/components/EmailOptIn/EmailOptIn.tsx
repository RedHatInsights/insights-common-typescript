import * as React from 'react';
import { Alert, AlertVariant, Text, TextContent } from '@patternfly/react-core';

import { Messages } from '../../properties/Messages';
import { Config } from '../../config';
import { InsightsType } from '../../utils';
import { ouiaParams } from '../../utils/Ouia';
import { format } from 'react-string-format';
import { WithOuia } from '@redhat-cloud-services/frontend-components';

interface EmailOptInProps {
    content: string;
    isBeta: boolean;
    bundle: string;
}

export const EmailOptIn = WithOuia((props: EmailOptInProps) => {
    const emailUrl = React.useMemo(() => Config.pages.emailPreferences(props.isBeta, props.bundle), [ props.bundle, props.isBeta ]);
    const content = React.useMemo(() => {
        return format(props.content, <a href={ Config.pages.notificationSettings(props.isBeta, props.bundle) }>notification settings</a>);
    }, [ props.content, props.bundle, props.isBeta ]);

    return (
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
    );
}, ouiaParams('EmailOptin'));

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
