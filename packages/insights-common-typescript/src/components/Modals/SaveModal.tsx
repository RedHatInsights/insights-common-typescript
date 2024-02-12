import * as React from 'react';
import { ActionModal, ActionModalProps } from './ActionModal';
import { ButtonVariant } from '@patternfly/react-core/dist/dynamic/components/Button';
import { SemiPartial } from '../../types/Utils';

type ChangedProps = 'isPerformingAction' | 'onAction';
type InheritedProps = 'isOpen' | 'title' | 'content'  | 'onClose' | 'error' | 'actionButtonDisabled' | 'variant' | 'titleIconVariant';

export type SaveModalProps = Omit<SemiPartial<ActionModalProps, InheritedProps>, ChangedProps> & {
    isSaving: boolean;
    onSave: () => boolean | Promise<boolean>;
}

export const SaveModal: React.FunctionComponent<SaveModalProps> = (props) => {
    return <ActionModal
        { ...props }
        isPerformingAction={ props.isSaving }
        onAction={ props.onSave }
        actionButtonTitle={ props.actionButtonTitle ?? 'Save' }
        actionButtonVariant={ props.actionButtonVariant ?? ButtonVariant.primary }
    />;
};
