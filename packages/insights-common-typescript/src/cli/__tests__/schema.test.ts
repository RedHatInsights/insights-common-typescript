import fetchMockJest from 'fetch-mock-jest';
import { execute } from '../schema';
import { existsSync, readFileSync } from 'fs';
import rimRaf from 'rimraf';
import fetchMock from 'node-fetch';

jest.mock('node-fetch', () => fetchMockJest.sandbox());

describe('src/cli/schema', () => {

    const tempSchemaDir = './tmp/schemas';

    it ('execute input file accepts path', () => {
        rimRaf.sync(tempSchemaDir);
        const log = jest.spyOn(console, 'log');
        log.mockImplementation(() => '');

        return execute({
            inputFile: './src/cli/__tests__/policies-openapi.json',
            output: tempSchemaDir
        }).then(() => {
            expect(log).toHaveBeenCalledWith('tmp/schemas/Types.ts generated');
            expect(log).toHaveBeenCalledWith('tmp/schemas/ActionCreators.ts generated');
            expect(existsSync('./tmp/schemas/ActionCreators.ts')).toBeTruthy();
            expect(existsSync('./tmp/schemas/Types.ts')).toBeTruthy();
            expect(readFileSync(`${tempSchemaDir}/Types.ts`).toString()).toMatchSnapshot();
            expect(readFileSync(`${tempSchemaDir}/ActionCreators.ts`).toString()).toMatchSnapshot();
            rimRaf.sync(tempSchemaDir);
        });
    });

    it ('execute accepts urls', async () => {
        rimRaf.sync(tempSchemaDir);

        (fetchMock as any).get('http://foobar.baz/my-openapi.json', {
            body: readFileSync('./src/cli/__tests__/policies-openapi.json').toString(),
            status: 200
        });

        const log = jest.spyOn(console, 'log');
        log.mockImplementation(() => '');

        return execute({
            inputFile: 'http://foobar.baz/my-openapi.json',
            output: tempSchemaDir
        }).then(() => {
            (fetchMock as any).restore();
            expect(log).toHaveBeenCalledWith('tmp/schemas/Types.ts generated');
            expect(log).toHaveBeenCalledWith('tmp/schemas/ActionCreators.ts generated');
            expect(existsSync('./tmp/schemas/ActionCreators.ts')).toBeTruthy();
            expect(existsSync('./tmp/schemas/Types.ts')).toBeTruthy();
            expect(readFileSync(`${tempSchemaDir}/Types.ts`).toString()).toMatchSnapshot();
            expect(readFileSync(`${tempSchemaDir}/ActionCreators.ts`).toString()).toMatchSnapshot();
            rimRaf.sync(tempSchemaDir);
        });
    });
});
