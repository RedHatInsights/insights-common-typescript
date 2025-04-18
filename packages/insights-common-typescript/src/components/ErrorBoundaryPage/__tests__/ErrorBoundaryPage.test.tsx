import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ErrorBoundaryPage } from '../../..';

jest.mock('@redhat-cloud-services/frontend-components/PageHeader', () => {

    const Children: React.FunctionComponent = (props) => {
        // eslint-disable-next-line testing-library/no-node-access
        return <span>{ props.children }</span>;
    };

    const Title: React.FunctionComponent<any> = (props) => {
        return <span>{ props.title }</span>;
    };

    return {
        PageHeader: Children,
        PageHeaderTitle: Title
    };
});

jest.mock('@redhat-cloud-services/frontend-components/Main', () => {

    const Children: React.FunctionComponent = (props) => {
        // eslint-disable-next-line testing-library/no-node-access
        return <span>{ props.children }</span>;
    };

    return {
        Main: Children
    };
});

describe('src/pages/Error/Page', () => {

    let mockConsole;

    beforeEach(() => {
        mockConsole = jest.spyOn(console, 'error');
        mockConsole.mockImplementation(() => '');
    });

    afterEach(() => {
        mockConsole.mockRestore();
    });

    it('Renders content when there is no error', () => {
        render(<ErrorBoundaryPage
            ouiaId={ 'error-boundary' }
            action={ jest.fn() }
            actionLabel={ 'Foo!' }
            title={ 'Something wrong' }
            pageHeader={ 'Policies' }
            description={ 'Something wrong happened' }
        >
            <div>hello world</div>
        </ErrorBoundaryPage>);

        expect(screen.getByText('hello world')).toBeVisible();
    });

    it('Renders error screen when there is an error', () => {
        const Surprise = () => {
            throw new Error('surprise');
        };

        render(<ErrorBoundaryPage
            ouiaId={ 'error-boundary' }
            action={ jest.fn() }
            actionLabel={ 'Foo!' }
            title={ 'Something wrong' }
            pageHeader={ 'Policies' }
            description={ 'Something wrong happened' }
        >
            <Surprise/>
        </ErrorBoundaryPage>);

        expect(screen.getByText(/Something wrong happened/i)).toBeVisible();
    });

    it('Details are hidden', () => {
        const Surprise = () => {
            throw new Error('surprise');
        };

        render(<ErrorBoundaryPage
            ouiaId={ 'error-boundary' }
            action={ jest.fn() }
            actionLabel={ 'Foo!' }
            title={ 'Something wrong' }
            pageHeader={ 'Policies' }
            description={ 'Something wrong happened' }
        >
            <Surprise/>
        </ErrorBoundaryPage>);

        expect(screen.getByText(/surprise/i)).not.toBeVisible();
    });

    it('Shows when show details is clicked', async () => {
        const Surprise = () => {
            throw new Error('surprise');
        };

        render(<ErrorBoundaryPage
            ouiaId={ 'error-boundary' }
            action={ jest.fn() }
            actionLabel={ 'Foo!' }
            title={ 'Something wrong' }
            pageHeader={ 'Policies' }
            description={ 'Something wrong happened' }
        >
            <Surprise/>
        </ErrorBoundaryPage>);

        await userEvent.click(screen.getByText(/show details/i));
        expect(screen.getByText(/surprise/i)).toBeVisible();
    });

    it('Action is fired when clicking the button', async () => {
        const Surprise = () => {
            throw new Error('surprise');
        };

        const action = jest.fn();

        render(<ErrorBoundaryPage
            ouiaId={ 'error-boundary' }
            action={ action }
            actionLabel={ 'Foo!' }
            title={ 'Something wrong' }
            pageHeader={ 'Policies' }
            description={ 'Something wrong happened' }
        >
            <Surprise/>
        </ErrorBoundaryPage>);

        await userEvent.click(screen.getByRole('button', {
            name: /foo/i
        }));
        expect(action).toHaveBeenCalledTimes(1);
    });
});
