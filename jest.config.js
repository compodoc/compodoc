module.exports = {
    coverageDirectory: './coverage/',
    collectCoverage: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/cli-jest/**/*.ts'],
    globals: {
        'ts-jest': {
            tsConfig: 'test/tsconfig-jest.json',
            diagnostics: false,
            isolatedModules: false
        }
    },
    collectCoverageFrom: ['**/src/**/*.ts', '!**/node_modules/**', '!**/test/**']
};
