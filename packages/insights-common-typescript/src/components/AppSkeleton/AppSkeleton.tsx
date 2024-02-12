import * as React from 'react';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Section } from '@redhat-cloud-services/frontend-components/Section';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components/PageHeader';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';

import { OuiaComponentProps, getOuiaProps } from '../../utils/Ouia';

export const AppSkeleton: React.FunctionComponent<OuiaComponentProps> = (props) => {

    return (
        <div { ...getOuiaProps('AppSkeleton', props) }>
            <PageHeader>
                <div className="pf-c-content">
                    <PageHeaderTitle title={ <Skeleton size="sm"/> }/>
                </div>
            </PageHeader>
            <Main>
                <Section>
                    <Bullseye>
                        <Spinner centered/>
                    </Bullseye>
                </Section>
            </Main>
        </div>
    );
};
