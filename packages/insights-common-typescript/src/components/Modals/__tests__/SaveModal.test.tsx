import * as React from 'react';
import { render } from '@testing-library/react';
import { ouiaSelectors } from 'insights-common-typescript-dev';
import { SaveModal } from '../..';
import '@testing-library/jest-dom';

describe('src/components/Modals/SaveModal', () => {
    it('Shows action modal with Save action button', () => {
        render(
            <SaveModal
                isSaving={ false }
                onSave={ jest.fn() }
                onClose={ jest.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF5/Button', 'action')
        ).toHaveTextContent('Save');
    });

    it('Shows action modal with action button style of Primary', () => {
        render(
            <SaveModal
                isSaving={ false }
                onSave={ jest.fn() }
                onClose={ jest.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF5/Button', 'action')
        ).toHaveClass('pf-m-primary');
    });

    it('Allows to change the action button text', () => {
        render(
            <SaveModal
                isSaving={ false }
                onSave={ jest.fn() }
                onClose={ jest.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
                actionButtonTitle="Foo"
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF5/Button', 'action')
        ).toHaveTextContent('Foo');
    });
});
