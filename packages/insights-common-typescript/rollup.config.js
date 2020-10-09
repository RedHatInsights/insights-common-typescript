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

const configEntriesForTsFile = (source, output) => [
    {
        input: source,
        output: [
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
                    'jest-mock': 'jestMock',
                    '@redhat-cloud-services/rbac-client': 'rbacClient',
                    axios: 'axios',
                    'react-router-dom': 'reactRouterDom',
                    'react-use': 'reactUse',
                    camelcase: 'camelcase'

                }
            },
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
        ],
        plugins: [
            wildcardExternal([ '@redhat-cloud-services/frontend-components-utilities/**' ]),
            typescript({
                sourceMap: true,
                declaration: false
            }),
            compiler()
        ],
        external: getDependencies()
    },
    {
        input: source,
        output: [{ file: `${output}.d.ts`, format: 'cjs' }],
        plugins: [
            dts()
        ]
    }
];

const config = configEntriesForTsFile('src/index.ts', 'index');

export default config;
