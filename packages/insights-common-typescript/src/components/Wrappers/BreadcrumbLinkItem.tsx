import * as React from 'react';
import { BreadcrumbItem, BreadcrumbItemProps } from '@patternfly/react-core/dist/dynamic/components/Breadcrumb';
import { LinkAdapter } from './LinkAdapter';
import { OuiaComponentProps, withoutOuiaProps } from '../../utils';
import { getOuiaProps } from '../../utils/Ouia';

type BreadcrumbLinkItemProps = Omit<BreadcrumbItemProps, 'component'> & OuiaComponentProps;

export const BreadcrumbLinkItem: React.FunctionComponent<BreadcrumbLinkItemProps> = (props) => {
    return (
        <BreadcrumbItem
            { ...withoutOuiaProps(props) }
            { ...getOuiaProps('BreadcrumbLinkItem', props) }
            component={ LinkAdapter }
        >
            { props.children }
        </BreadcrumbItem>
    );
};
