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
        external: [
            'zod'
        ],
        plugins: [
            json(),
            typescript({
                allowSyntheticDefaultImports: true
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
        external: [
            'zod'
        ],
        plugins: [
            dts()
        ]
    },
    {
        input: 'src/react-fetching-library.ts',
        output: [
            {
                file: 'react-fetching-library.js',
                format: 'umd',
                name: 'react-fetching-library',
                sourcemap: true
            },
            {
                file: 'esm/react-fetching-library.js',
                format: 'esm',
                sourcemap: true
            },
            {
                file: 'cjs/react-fetching-library.js',
                format: 'cjs',
                sourcemap: true
            }
        ],
        external: [
            'zod', 'react-fetching-library'
        ],
        plugins: [
            json(),
            typescript({
                allowSyntheticDefaultImports: true
            }),
            commonjs({
                extensions
            }),
            compiler()
        ]
    },
    {
        input: 'src/react-fetching-library.ts',
        output: [
            {
                file: 'react-fetching-library.d.ts'
            }
        ],
        external: [
            'zod', 'react-fetching-library'
        ],
        plugins: [
            dts()
        ]
    }
];

export default config;
