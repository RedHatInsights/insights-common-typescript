#!/usr/bin/env node

import { Command } from 'commander';
import * as jq from 'node-jq';
import { CLIEngine } from 'eslint';
import fetch from 'node-fetch';
import prettier from 'prettier';
import isUrl from 'is-url';
import { existsSync, lstatSync, writeFileSync } from 'fs';

import { SchemaActionBuilder, SchemaTypeBuilder, OpenAPI3 } from './schema/';

export interface Options {
    inputFile: string;
    output: string;
    skipPostProcess?: boolean;
}

const getProgram = () => {
    const program = new Command();

    program
    .description('Generates the actions needed by react-fetching-library to do the queries out of the openapi.json file')
    .option(
        '-s, --skip-post-process',
        'Skips the postprocess (prettier and linter)',
        false
    )
    .requiredOption(
        '-i, --input-file <openapijson-path>',
        'URL or local path to the openapi.json file.'
    )
    .requiredOption(
        '-o, --output <output-path>',
        'Output file to put the generated files.'
    );

    return program;
};

export const execute = async (options: Options) => {

    let inputType = 'file';
    let input = options.inputFile;

    if (isUrl(options.inputFile)) {
        inputType = 'string';
        input = await fetch(options.inputFile, {
            headers: {
                Accept: 'application/json'
            }
        }).then(res => res.text());
    }

    if (existsSync(options.output)) {
        const fileStat = lstatSync(options.output);
        if (fileStat.isDirectory()) {
            options.output = `${options.output}/Generated.ts`;
        }
    }

    return jq.run('.', input, {
        sort: true,
        input: inputType
    }).then(output => JSON.parse(output as string) as OpenAPI3)
    .then(openapi => {
        const buffer: Array<string> = [
            'import * as z from \'zod\';\n',
            'import { actionBuilder, ValidatedResponse, ActionValidatable } from \'@redhat-cloud-services/insights-common-typescript\';\n',
            'import { Action } from \'react-fetching-library\';\n',
            '/* eslint-disable @typescript-eslint/no-use-before-define */\n\n'
        ];

        const typeBuilder = new SchemaTypeBuilder(openapi, buffer);
        const actionBuilder = new SchemaActionBuilder(openapi, buffer);

        typeBuilder.build();
        actionBuilder.build();
        return buffer.join('');
    }).then(content => {
        if (options.skipPostProcess) {
            return content;
        }

        return prettier.format(
            content,
            {
                parser: 'typescript'
            }
        );
    }).then(async (content) => {
        if (options.skipPostProcess) {
            return writeFileSync(options.output, content);
        }

        const eslint = new CLIEngine({
            fix: true
        });
        const results = await eslint.executeOnText(content, options.output);
        return CLIEngine.outputFixes(results);
    });
};

if (require.main === module) {
    const program = getProgram();
    program.parse(process.argv);
    execute(program as unknown as Options);
}
