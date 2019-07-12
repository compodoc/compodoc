module.exports = {
    coverageDirectory: './coverage/',
    collectCoverage: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/src-refactored/**/**.spec.ts'],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    verbose: true,
    collectCoverageFrom: ['**/src-refactored/**/*.ts', '!**/node_modules/**', '!**/test/**']
};
