import * as React from 'react';
import { render } from '@testing-library/react';
import { ouiaSelectors } from 'insights-common-typescript-dev';
import { DeleteModal } from '../..';
import '@testing-library/jest-dom';

describe('src/components/Modals/DeleteModal', () => {
    it('Shows action modal with Delete action button', () => {
        render(
            <DeleteModal
                isDeleting={ false }
                onDelete={ jest.fn() }
                onClose={ jest.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF5/Button', 'action')
        ).toHaveTextContent('Delete');
    });

    it('Shows action modal with action button style of Danger', () => {
        render(
            <DeleteModal
                isDeleting={ false }
                onDelete={ jest.fn() }
                onClose={ jest.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF5/Button', 'action')
        ).toHaveClass('pf-m-danger');
    });
});
