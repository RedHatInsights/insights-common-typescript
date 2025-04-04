import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import wildcardExternal from '@oat-sa/rollup-plugin-wildcard-external';
import execute from 'rollup-plugin-execute';
import tsImportPluginFactory from 'ts-import-plugin';
import pkg from './package.json';
import mainPkg from './../../package.json';

export default function makeConfig(params) {
    const getDependencies = () => {
        return Object.keys(pkg.peerDependencies)
        .concat(Object.keys(pkg.dependencies))
        .concat(Object.keys(mainPkg.devDependencies))
        .map(path => `${path}`);
    };

    const getPlugins = () => {
        const plugins = [
            wildcardExternal([ '@redhat-cloud-services/frontend-components-utilities/**' ]),
            typescript({
                sourceMap: true,
                declaration: false,
                exclude: /__tests__/,
                transformers: {
                    before: [
                        tsImportPluginFactory({
                            libraryName: '@patternfly/react-tokens',
                            libraryDirectory: 'dist/js',
                            camel2DashComponentName: false
                        }),
                        tsImportPluginFactory({
                            libraryName: '@patternfly/react-icons',
                            libraryDirectory: 'dist/js/icons',
                            camel2DashComponentName: true
                        })
                    ]
                }
            })
        ];

        if (!params.watch) {
            plugins.push(compiler());
        }

        return plugins;
    };

    const configEntriesForTsFile = (source, output) => {

        const jsOutput = [
            {
                file: `${output}.js`,
                name: output,
                format: 'umd',
                sourcemap: true,
                globals: {
                    react: 'React',
                    '@redhat-cloud-services/frontend-components': 'frontendComponents',
                    '@patternfly/react-core': 'reactCore',
                    tslib: 'tslib',
                    typestyle: 'typestyle',
                    csx: 'csx',
                    '@patternfly/react-tokens': 'reactTokens',
                    '@patternfly/react-icons': 'reactIcons',
                    formik: 'formik',
                    '@redhat-cloud-services/frontend-components-notifications': 'frontendComponentsNotifications',
                    '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry': 'ReducerRegistry',
                    'redux-promise-middleware': 'promiseMiddleware',
                    'react-fetching-library': 'reactFetchingLibrary',
                    '@redhat-cloud-services/rbac-client': 'rbacClient',
                    axios: 'axios',
                    'react-router-dom': 'reactRouterDom',
                    'react-use': 'reactUse',
                    camelcase: 'camelcase'

                }
            }
        ];

        const dtsPlugins = [
            dts()
        ];

        if (!params.watch) {
            jsOutput.push(
                {
                    file: `esm/${output}.js`,
                    format: 'esm',
                    sourcemap: true
                },
                {
                    file: `cjs/${output}.js`,
                    format: 'cjs',
                    sourcemap: true
                }
            );
        } else {
            dtsPlugins.push(execute('which yalc > /dev/null && yalc publish --changed --push'));
        }

        return [
            {
                input: source,
                output: jsOutput,
                plugins: getPlugins(),
                external: getDependencies()
            },
            {
                input: source,
                output: [{ file: `${output}.d.ts`, format: 'cjs' }],
                plugins: dtsPlugins
            }
        ];
    };

    return configEntriesForTsFile('src/index.ts', 'index');
}
