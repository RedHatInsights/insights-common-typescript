import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import dts from 'rollup-plugin-dts';
import execute from 'rollup-plugin-execute';

const extensions = [ '.js', '.ts' ];

export default function makeConfig(params) {

    const outputs = [
        {
            file: 'index.js',
            format: 'umd',
            name: 'index',
            sourcemap: true
        }
    ];

    const dtsPlugin = [
        dts(execute('which yalc > /dev/null && yalc publish --changed --push'))
    ];

    if (!params.watch) {
        outputs.push(
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
        );
    } else {
        dtsPlugin.push();
    }

    return [
        {
            input: 'src/index.ts',
            output: outputs,
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
            plugins: dtsPlugin
        }
    ];
}
