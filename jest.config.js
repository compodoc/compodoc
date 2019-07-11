module.exports = {
    coverageDirectory: './coverage/',
    collectCoverage: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/helpers/**/**.spec.ts', '**/cli-jest/**/*.ts'],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    verbose: true,
    collectCoverageFrom: ['**/src/**/*.ts', '!**/node_modules/**', '!**/test/**']
};
