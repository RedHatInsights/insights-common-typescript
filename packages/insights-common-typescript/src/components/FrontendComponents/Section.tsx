import * as React from 'react';
import { Section as IFCSection, DarkContext, useOuia, OuiaProps } from '@redhat-cloud-services/frontend-components';
import { classes } from 'typestyle';
import { ouiaParams } from '../../utils/Ouia';

interface SectionProps extends OuiaProps {
    className?: string;
}

export const Section: React.FunctionComponent<SectionProps> = (props) => {
    const ouiaData = useOuia(ouiaParams('Section'));

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
                    { ...ouiaData }
                    className={ className }>
                    { props.children }
                </IFCSection>;
            }}
        </DarkContext.Consumer>
    );
};
