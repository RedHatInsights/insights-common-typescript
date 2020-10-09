import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import dts from 'rollup-plugin-dts';

const extensions = [ '.js', '.ts' ];

const config = [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'index.js',
                format: 'umd',
                name: 'index',
                sourcemap: true
            },
            {
                file: 'esm/index.js',
                format: 'esm',
                sourcemap: true
            },
            {
                file: 'cjs/index.js',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [
            json(),
            typescript({
                allowSyntheticDefaultImports: true,
                exclude: /__tests__/ig
            }),
            commonjs({
                extensions
            }),
            compiler()
        ]
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'index.d.ts'
            }
        ],
        plugins: [
            dts()
        ]
    }
];

export default config;
