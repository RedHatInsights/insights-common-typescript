import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import execute from 'rollup-plugin-execute';

export default function makeConfig(params) {
    const extensions = [ '.js', '.ts' ];

    const plugins = [
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
                'camelcase',
                'assert-never'
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
    ];

    if (params.watch) {
        plugins.push(execute('which yalc > /dev/null && yalc publish --changed --push'));
    }

    return [
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
                'fs', 'child_process', 'path', 'readline', 'os', 'events', 'util', 'prettier'
            ],
            plugins
        }
    ];
}
