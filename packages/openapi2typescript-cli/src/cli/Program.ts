import { Command } from 'commander';
import { ActionGeneratorType } from '../core/types/ActionGeneratorType';

export const getProgram = () => {
    const program = new Command();

    program
    .description(
        'Generates typescript code from Openapi files.\n'
        + 'Code includes request and response types for every operation.\n'
        + 'For responses, uses zod to create validators for every status code.\n'
        + 'It optionally can create binding code for:\n'
        + '- react-fetching-library\n'
    )
    .option(
        '-s, --skip-post-process',
        'Skips the postprocess (prettier and linter)',
        false
    )
    .option(
        '-a, --action-generator <action-generator>',
        'Chooses the generator for the actions by client:\n'
        + '- react-fetching-library: https://github.com/marcin-piela/react-fetching-library\n'
        + '- none: Does not generate any action, only the validators and the types.\n',
        (actionGenerator: string): ActionGeneratorType => {
            if (actionGenerator.toUpperCase() === 'REACT-FETCHING-LIBRARY') {
                return ActionGeneratorType.REACT_FETCHING_LIBRARY;
            } else if (actionGenerator.toUpperCase() === 'NONE') {
                return ActionGeneratorType.NONE;
            }

            throw new Error(`Unknown action generator: ${actionGenerator}`);
        },
        ActionGeneratorType.NONE
    )
    .option(
        '-ed, --add-eslint-disable',
        'Add /* eslint-disable */ on top of the file after processing',
        false
    )
    .option(
        '-st, --skip-types',
        'Skip the types, useful for js building',
        false
    )
    .requiredOption(
        '-i, --input <openapijson-file-or-url>',
        'URL or local path to the openapi.json file.'
    )
    .requiredOption(
        '-o, --output <output-path>',
        'Output file to put the generated files.'
    );

    return program;
};
