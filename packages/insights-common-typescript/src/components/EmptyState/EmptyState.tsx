import * as React from 'react';
import { Button, EmptyState as EmptyStatePf, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { global_spacer_3xl } from '@patternfly/react-tokens';
import { style } from 'typestyle';
import { calc } from 'csx';
import { OuiaComponentProps } from '../../utils';
import { getOuiaProps } from '../../utils/Ouia';

const emptyStateClassName = style({
    paddingTop: calc(`${ global_spacer_3xl.var } - var(--pf-c-page__main-section--PaddingTop)`)
});

export interface EmptyStateSectionProps extends OuiaComponentProps {
    icon?: React.ComponentType<any>;
    iconColor?: string;
    title: string;
    content: React.ReactNode;
    action?: () => void;
    actionNode?: React.ReactNode;
    actionLabel?: string;
    className?: string;
}

export const EmptyState: React.FunctionComponent<EmptyStateSectionProps> = (props) => (
    <div { ...getOuiaProps('EmptyState', props) } >
        <EmptyStatePf variant={ EmptyStateVariant.full } className={ `${emptyStateClassName} ${props.className ? props.className : ''} ` }>
            { props.icon && <EmptyStateIcon icon={ props.icon } color={ props.iconColor } /> }
            <Title headingLevel="h5" size="lg">
                { props.title }
            </Title>
            <EmptyStateBody>
                { props.content }
            </EmptyStateBody>
            { props.actionNode }
            { props.actionLabel && (
                <Button variant="primary" onClick={ props.action } isDisabled={ !props.action } >{ props.actionLabel }</Button>
            ) }
        </EmptyStatePf>
    </div>
);
