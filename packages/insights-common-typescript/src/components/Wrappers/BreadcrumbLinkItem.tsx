import * as React from 'react';
import { BreadcrumbItem, BreadcrumbItemProps } from '@patternfly/react-core';
import { LinkAdapter } from './LinkAdapter';
import { OuiaProps, useOuia, withoutOuiaProps } from '@redhat-cloud-services/frontend-components';
import { ouiaParams } from '../../utils/Ouia';

type BreadcrumbLinkItemProps = Omit<BreadcrumbItemProps, 'component'> & OuiaProps;

export const BreadcrumbLinkItem: React.FunctionComponent<BreadcrumbLinkItemProps> = (props) => {
    const ouiaData = useOuia(ouiaParams('BreadcrumbLinkItem'));

    return (
        <BreadcrumbItem
            { ...withoutOuiaProps(props) }
            { ...ouiaData }
            component={ LinkAdapter }
        >
            { props.children }
        </BreadcrumbItem>
    );
};
