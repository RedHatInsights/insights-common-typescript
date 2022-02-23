import * as React from 'react';
import { render } from '@testing-library/react';
import jestMock from 'jest-mock';
import { ouiaSelectors } from '@redhat-cloud-services/frontend-components-testing';
import { DeleteModal } from '../..';

describe('src/components/Modals/DeleteModal', () => {
    it('Shows action modal with Delete action button', () => {
        render(
            <DeleteModal
                isDeleting={ false }
                onDelete={ jestMock.fn() }
                onClose={ jestMock.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF4/Button', 'action')
        ).toHaveTextContent('Delete');
    });

    it('Shows action modal with action button style of Danger', () => {
        render(
            <DeleteModal
                isDeleting={ false }
                onDelete={ jestMock.fn() }
                onClose={ jestMock.fn() }
                isOpen={ true }
                title={ 'foobar' }
                content={ 'content' }
            />
        );

        expect(
            ouiaSelectors.getByOuia('PF4/Button', 'action')
        ).toHaveClass('pf-m-danger');
    });
});
