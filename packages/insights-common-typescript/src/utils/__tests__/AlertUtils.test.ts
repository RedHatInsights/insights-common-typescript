import {
    addNotification as createNotificationAction,
    clearNotifications as createClearNotifications
} from '@redhat-cloud-services/frontend-components-notifications';
import {
    addInfoNotification,
    addNotification,
    addSuccessNotification,
    addWarningNotification,
    addDangerNotification,
    NotificationType,
    clearNotifications,
    getStore,
    initStore,
    restoreStore
} from '../..';

describe('src/utils/AlertUtils', () => {

    let dispatch;

    beforeAll(() => {
        restoreStore();
        initStore();
        dispatch = jest.spyOn(getStore(), 'dispatch');
    });

    it('Add notifications calls the store with the notification', () => {
        addNotification(NotificationType.INFO, 'foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(createNotificationAction({
            variant: 'info',
            title: 'foo',
            description: 'bar'
        }));
    });

    it('Add notifications accepts dismissable and dismissDelay', () => {
        addNotification(NotificationType.INFO, 'foo', 'bar', true, 9000);
        expect(dispatch).toHaveBeenCalledWith(createNotificationAction({
            variant: 'info',
            title: 'foo',
            description: 'bar',
            dismissable: true,
            dismissDelay: 9000
        }));
    });

    it('addSuccessNotification creates a notification action with "success"', () => {
        addSuccessNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(createNotificationAction({
            variant: 'success',
            title: 'foo',
            description: 'bar'
        }));
    });

    it('addSuccessNotification creates a notification action with "info"', () => {
        addInfoNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(createNotificationAction({
            variant: 'info',
            title: 'foo',
            description: 'bar'
        }));
    });

    it('addSuccessNotification creates a notification action with "warning"', () => {
        addWarningNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(createNotificationAction({
            variant: 'warning',
            title: 'foo',
            description: 'bar'
        }));
    });

    it('addSuccessNotification creates a notification action with "danger"', () => {
        addDangerNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(createNotificationAction({
            variant: 'danger',
            title: 'foo',
            description: 'bar'
        }));
    });

    it('clearNotifications creates a clearNotifications call', () => {
        clearNotifications();
        expect(dispatch).toHaveBeenCalledWith(createClearNotifications());
    });
});
