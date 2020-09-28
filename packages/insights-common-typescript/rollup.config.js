import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import wildcardExternal from '@oat-sa/rollup-plugin-wildcard-external';
import pkg from './package.json';
import mainPkg from './../../package.json';

const getDependencies = () => {
    return Object.keys(pkg.peerDependencies)
    .concat(Object.keys(pkg.dependencies))
    .concat(Object.keys(mainPkg.devDependencies))
    .map(path => `${path}`);
};

const configEntriesForTsFile = (source, jsOutput, dtsFile) => [
    {
        input: source,
        output: [
            {
                file: jsOutput,
                format: 'cjs'
            }
        ],
        plugins: [
            wildcardExternal([ '@redhat-cloud-services/frontend-components-utilities/**' ]),
            typescript({
                sourceMap: false,
                declaration: false
            }),
            compiler()
        ],
        external: getDependencies()
    },
    {
        input: source,
        output: [{ file: dtsFile, format: 'cjs' }],
        plugins: [
            dts()
        ]
    }
];

const config = [
    ...configEntriesForTsFile('src/index.ts', pkg.main, pkg.types),
    ...configEntriesForTsFile('src/dev/index.ts', 'dev/index.js', 'dev/index.d.ts'),
    {
        input: 'src/cli/schema.ts',
        output: [
            {
                file: 'lib/cli/schema.js',
                format: 'cjs',
                banner: '#!/usr/bin/env node'
            }
        ],
        plugins: [
            typescript({
                sourceMap: false,
                declaration: false,
                allowSyntheticDefaultImports: true
            }),
            compiler()
        ],
        external: [ ...getDependencies(), 'fs' ]
    }
];

export default config;
