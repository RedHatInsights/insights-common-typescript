import fetchMock from 'fetch-mock';
import { getInsights, mockInsights, createFetchingClient } from '../..';

describe('src/app/FetchingConfiguration', () => {

    beforeAll(() => {
        mockInsights();
    });

    it('Configures to get the user on every request', async () => {
        fetchMock.get('/foo', {
            status: 200
        });

        expect(getInsights().chrome.auth.getUser).toHaveBeenCalledTimes(0);

        const response = await createFetchingClient(getInsights).query({
            endpoint: '/foo',
            method: 'GET'
        });

        expect(response.status).toBe(200);
        expect(getInsights().chrome.auth.getUser).toHaveBeenCalledTimes(1);
    });
});
