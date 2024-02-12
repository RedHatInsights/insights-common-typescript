import {
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

    beforeEach(() => {
        restoreStore();
        initStore();
        dispatch = jest.spyOn(getStore(), 'dispatch');
    });

    it('Add notifications calls the store with the notification', () => {
        addNotification(NotificationType.INFO, 'foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: expect.objectContaining({
            variant: 'info',
            title: 'foo',
            description: 'bar',
          })
        }));
    });

    it('Add notifications accepts dismissable', () => {
        addNotification(NotificationType.INFO, 'foo', 'bar', true);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: expect.objectContaining({
            variant: 'info',
            title: 'foo',
            description: 'bar',
            dismissable: true,
          })
        }));
    });

    it('addSuccessNotification creates a notification action with "success"', () => {
        addSuccessNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: expect.objectContaining({
            variant: 'success',
            title: 'foo',
            description: 'bar',
          })
        }));
    });

    it('addSuccessNotification creates a notification action with "info"', () => {
        addInfoNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: expect.objectContaining({
            variant: 'info',
            title: 'foo',
            description: 'bar',
          })
        }));
    });

    it('addSuccessNotification creates a notification action with "warning"', () => {
        addWarningNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: expect.objectContaining({
            variant: 'warning',
            title: 'foo',
            description: 'bar',
          })
        }));
    });

    it('addSuccessNotification creates a notification action with "danger"', () => {
        addDangerNotification('foo', 'bar');
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: expect.objectContaining({
            variant: 'danger',
            title: 'foo',
            description: 'bar',
          })
        }));
    });

    it('clearNotifications creates a clearNotifications call', () => {
        clearNotifications();
        expect(dispatch).toHaveBeenCalledWith(createClearNotifications());
    });
});
