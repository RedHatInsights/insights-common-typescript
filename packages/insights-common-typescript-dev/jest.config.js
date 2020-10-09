module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    coverageDirectory: './coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/node_modules/**'
    ],
    testMatch: [
        '**/*.{ts,tsx}'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/config/setupTestFramework.ts'
    ],
    roots: [
        '<rootDir>/tests'
    ]
};
