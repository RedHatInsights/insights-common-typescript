import fetchMockJest from 'fetch-mock-jest';
import { execute } from '../src/main';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import rimRaf from 'rimraf';
import fetchMock from 'node-fetch';
import { ActionGeneratorType } from '../src/core/types/ActionGeneratorType';

jest.mock('node-fetch', () => fetchMockJest.sandbox());

describe('src/cli/schema', () => {
    describe.each([
        './tests/__fixtures__/notifications-openapi.json',
        './tests/__fixtures__/policies-openapi.json',
        './tests/__fixtures__/simple-openapi.json'
    ])('execute for %s', (filename) => {

        const tempSchemaDir = './tmp/schemas';

        beforeEach(() => {
            mkdirSync(tempSchemaDir, {
                recursive: true
            });
        });

        afterEach(() => {
            rimRaf.sync(tempSchemaDir);
        });

        it('execute input file accepts path', () => {
            return execute({
                input: filename,
                output: tempSchemaDir,
                skipPostProcess: false,
                addEslintDisable: true,
                actionGenerator: ActionGeneratorType.REACT_FETCHING_LIBRARY,
                skipTypes: true
            }).then(() => {
                expect(existsSync(`${tempSchemaDir}/Generated.ts`)).toBeTruthy();
                expect(readFileSync(`${tempSchemaDir}/Generated.ts`).toString()).toMatchSnapshot();

            });
        });

        it('execute accepts urls', async () => {
            (fetchMock as any).get('http://foobar.baz/my-openapi.json', {
                body: readFileSync(filename).toString(),
                status: 200
            });

            return execute({
                input: 'http://foobar.baz/my-openapi.json',
                output: tempSchemaDir,
                addEslintDisable: true,
                skipPostProcess: false,
                skipTypes: false,
                actionGenerator: ActionGeneratorType.REACT_FETCHING_LIBRARY
            }).then(() => {
                (fetchMock as any).restore();
                expect(existsSync(`${tempSchemaDir}/Generated.ts`)).toBeTruthy();
                expect(readFileSync(`${tempSchemaDir}/Generated.ts`).toString()).toMatchSnapshot();
            });
        });
    });
});
