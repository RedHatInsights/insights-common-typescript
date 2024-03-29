import {
    addNotification as createNotificationAction,
    clearNotifications as createClearNotificationsAction
} from '@redhat-cloud-services/frontend-components-notifications';
import { getStore } from '../store';

export enum NotificationType {
    SUCCESS = 'success',
    DANGER = 'danger',
    WARNING = 'warning',
    INFO = 'info'
}

export const addNotification = (
    type: NotificationType,
    title: string,
    description: React.ReactNode,
    dismissable?: boolean) => {
    getStore().dispatch(createNotificationAction({
        variant: type,
        title,
        description,
        dismissable
    }));
};

type ExplicitNotificationFunction = (title: string, description: React.ReactNode, dismissable?: boolean) => void;

export const addSuccessNotification: ExplicitNotificationFunction = (...args) => addNotification(NotificationType.SUCCESS, ...args);
export const addDangerNotification: ExplicitNotificationFunction = (...args) => addNotification(NotificationType.DANGER, ...args);
export const addInfoNotification: ExplicitNotificationFunction = (...args) => addNotification(NotificationType.INFO, ...args);
export const addWarningNotification: ExplicitNotificationFunction = (...args) => addNotification(NotificationType.WARNING, ...args);

export const clearNotifications = () => {
    getStore().dispatch(createClearNotificationsAction());
};
