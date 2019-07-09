module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'test/src/cli-jest',
    globals: {
        'ts-jest': {
            tsConfig: 'test/tsconfig-jest.json'
        }
    }
};
