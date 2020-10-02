#!/usr/bin/env node

import { Command } from 'commander';
import * as jq from 'node-jq';
import { CLIEngine } from 'eslint';
import fetch from 'node-fetch';
import prettier from 'prettier';
import isUrl from 'is-url';
import { existsSync, lstatSync, writeFileSync } from 'fs';

import { SchemaActionBuilder, SchemaTypeBuilder, OpenAPI3 } from './schema/';
import { buildApiDescriptor } from './schema/ApiDescriptorBuilder';

export interface Options {
    inputFile: string;
    output: string;
    skipPostProcess?: boolean;
    skipActionGenerator?: boolean;
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
    .option(
        '-sa, --skip-action-generator',
        'Skips the actions generators used for react-fetching-library',
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
    .then(openapi => buildApiDescriptor(openapi, {
        nonRequiredPropertyIsNull: true
    }))
    .then(descriptor => {
        const actionGeneratorHeaders = [
            'import { actionBuilder, ValidatedResponse, ActionValidatable } from \'@redhat-cloud-services/insights-common-typescript\';\n',
            'import { Action } from \'react-fetching-library\';\n'
        ];

        const buffer: Array<string> = [
            '/**\n',
            '* Generated code, DO NOT modify directly.\n',
            '*/\n',
            'import * as z from \'zod\';\n',
            ...(options.skipActionGenerator ? [] : actionGeneratorHeaders),
            '/* eslint-disable @typescript-eslint/camelcase */\n',
            '/* eslint-disable @typescript-eslint/no-use-before-define */\n\n'
        ];

        const typeBuilder = new SchemaTypeBuilder(descriptor, buffer);
        typeBuilder.build();

        if (!options.skipActionGenerator) {
            const actionBuilder = new SchemaActionBuilder(descriptor, buffer);
            actionBuilder.build();
        }

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
        if (results.fixableErrorCount || results.fixableWarningCount) {
            return CLIEngine.outputFixes(results);
        }

        return writeFileSync(options.output, content);
    });
};

if (require.main === module) {
    const program = getProgram();
    program.parse(process.argv);
    execute(program as unknown as Options);
}
