import fetchMockJest from 'fetch-mock-jest';
import { execute } from '../schema';
import fs, { existsSync, readFileSync, writeFileSync } from 'fs';
import rimRaf from 'rimraf';
import fetchMock from 'node-fetch';
import policiesOpenApi from './policies-openapi.json';
import notificationsOpenApi from './notifications-openapi.json';
import { SchemaActionBuilder, SchemaTypeBuilder } from '../schema/zodschema';
import prettier from 'prettier';
import { CLIEngine } from 'eslint';

jest.mock('node-fetch', () => fetchMockJest.sandbox());

describe('src/cli/schema', () => {

    const tempSchemaDir = './tmp/schemas';

    it('execute input file accepts path', () => {
        const log = jest.spyOn(console, 'log');
        log.mockImplementation(() => '');

        return execute({
            inputFile: './src/cli/__tests__/notifications-openapi.json',
            output: tempSchemaDir
        }).then(() => {
            expect(log).toHaveBeenCalledWith('tmp/schemas/Types.ts generated');
            expect(log).toHaveBeenCalledWith('tmp/schemas/ActionCreators.ts generated');
            expect(existsSync('./tmp/schemas/ActionCreators.ts')).toBeTruthy();
            expect(existsSync('./tmp/schemas/Types.ts')).toBeTruthy();
            // expect(readFileSync(`${tempSchemaDir}/Types.ts`).toString()).toMatchSnapshot();
            // expect(readFileSync(`${tempSchemaDir}/ActionCreators.ts`).toString()).toMatchSnapshot();

        }).finally(() => {
            // rimRaf.sync(tempSchemaDir);
            log.mockRestore();
        });
    });

    it('execute accepts urls', async () => {
        rimRaf.sync(tempSchemaDir);

        (fetchMock as any).get('http://foobar.baz/my-openapi.json', {
            body: policiesOpenApi,
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
        }).finally(() => {
            log.mockRestore();
            rimRaf.sync(tempSchemaDir);
        });
    });

    it.only('test new', async () => {
        const prettify = true;

        const arr = [
            'import * as z from \'zod\';\n',
            'import { actionBuilder, ValidatedResponse, ActionValidatable } from \'@redhat-cloud-services/insights-common-typescript\';\n',
            'import { Action } from \'react-fetching-library\';\n',
            '/* eslint-disable @typescript-eslint/no-use-before-define */\n\n'
        ];
        new SchemaTypeBuilder(notificationsOpenApi as any, arr);
        new SchemaActionBuilder(notificationsOpenApi as any, arr);
        const out = tempSchemaDir + '/zodschematest.ts';

        if (prettify) {
            const result = prettier.format(
                arr.join(''),
                {
                    parser: 'typescript'
                }
            );

            writeFileSync(out, result);

            const eslint = new CLIEngine({
                fix: true
            });
            const results = await eslint.executeOnFiles([ out ]);
            CLIEngine.outputFixes(results);
        } else {
            writeFileSync(out, arr.join(''));
        }

        /*
        const actionsArr = [ 'import * as z from \'zod\';\n\n' ];
        new SchemaActionBuilder(notificationsOpenApi as any, actionsArr);
        const outActions = tempSchemaDir + '/ZodActionCreator.ts';

        if (prettify) {
            const result = prettier.format(
                actionsArr.join(''),
                {
                    parser: 'typescript'
                }
            );

            writeFileSync(outActions, result);

            const eslint = new CLIEngine({
                fix: true
            });
            const results = await eslint.executeOnFiles([ out ]);
            CLIEngine.outputFixes(results);
        } else {
            writeFileSync(outActions, actionsArr.join(''));
        }*/


    });
});
