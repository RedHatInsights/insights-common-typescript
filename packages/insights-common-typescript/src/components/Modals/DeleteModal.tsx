import * as React from 'react';
import { ActionModal, ActionModalProps } from './ActionModal';
import { ButtonVariant } from '@patternfly/react-core';
import { SemiPartial } from '../../types/Utils';

type ChangedProps = 'isPerformingAction' | 'onAction';
type InheritedProps = 'isOpen' | 'title' | 'content'  | 'onClose' | 'error' | 'variant';

export type DeleteModalProps = Omit<SemiPartial<ActionModalProps, InheritedProps>, ChangedProps> & {
    isDeleting: boolean;
    onDelete: () => boolean | Promise<boolean>;
}

export const DeleteModal: React.FunctionComponent<DeleteModalProps> = (props) => {
    return <ActionModal
        { ...props }
        actionButtonTitle={ props.actionButtonTitle ?? 'Delete' }
        actionButtonVariant={ props.actionButtonVariant ?? ButtonVariant.danger }
        titleIconVariant={ props.titleIconVariant ?? 'warning' }
        isPerformingAction={ props.isDeleting }
        onAction={ props.onDelete }
    />;
};
