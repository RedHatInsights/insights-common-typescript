import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const extensions = [ '.js', '.ts' ];

const config = [
    {
        input: 'src/main.ts',
        output: [
            {
                file: 'lib/main.js',
                format: 'cjs',
                banner: '#!/usr/bin/env node'
            }
        ],
        external: [
            'fs', 'child_process', 'path', 'readline', 'os', 'events', 'util'
        ],
        plugins: [
            json(),
            typescript({
                sourceMap: false,
                declaration: false,
                allowSyntheticDefaultImports: true,
                include: 'src/**/*'
            }),
            resolve({
                resolveOnly: [
                    'node-fetch',
                    'is-url',
                    'commander',
                    'camelcase'
                ],
                extensions,
                preferBuiltins: false
            }),
            commonjs({
                extensions,
                ignore: [
                    'camelcase'
                ]
            })
        ]
    }
];

export default config;
