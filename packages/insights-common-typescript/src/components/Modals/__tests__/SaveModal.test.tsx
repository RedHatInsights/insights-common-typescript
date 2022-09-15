import * as React from 'react';
import { render } from '@testing-library/react';
import jestMock from 'jest-mock';
import { ouiaSelectors } from '@redhat-cloud-services/frontend-components-testing';
import { SaveModal } from '../..';

describe('src/components/Modals/SaveModal', () => {
    it('Shows action modal with Save action button', () => {
        render(
            <SaveModal
                isSaving={ false }
                onSave={ jestMock.fn() }
                onClose={ jestMock.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF4/Button', 'action')
        ).toHaveTextContent('Save');
    });

    it('Shows action modal with action button style of Primary', () => {
        render(
            <SaveModal
                isSaving={ false }
                onSave={ jestMock.fn() }
                onClose={ jestMock.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF4/Button', 'action')
        ).toHaveClass('pf-m-primary');
    });

    it('Allows to change the action button text', () => {
        render(
            <SaveModal
                isSaving={ false }
                onSave={ jestMock.fn() }
                onClose={ jestMock.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
                actionButtonTitle="Foo"
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF4/Button', 'action')
        ).toHaveTextContent('Foo');
    });
});
