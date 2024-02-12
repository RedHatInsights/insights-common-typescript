import * as React from 'react';
import { Section as IFCSection } from '@redhat-cloud-services/frontend-components/Section';
import { DarkContext } from '@redhat-cloud-services/frontend-components/Dark';
import { classes } from 'typestyle';
import { OuiaComponentProps } from '../../utils';
import { getOuiaProps } from '../../utils/Ouia';

interface SectionProps extends OuiaComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Section: React.FunctionComponent<SectionProps> = (props) => {
    return (
        <DarkContext.Consumer>
            { (theme = 'light') => {
                const className = classes(
                    props.className,
                    'pf-l-page__main-section',
                    'pf-c-page__main-section',
                    theme === 'dark' ? 'pf-m-dark-200' : '',
                    theme === 'light' ? 'pf-m-light' : ''
                );
                return <IFCSection
                    { ...getOuiaProps('Section', props) }
                    style={ props.style }
                    className={ className }>
                    { props.children }
                </IFCSection>;
            }}
        </DarkContext.Consumer>
    );
};
