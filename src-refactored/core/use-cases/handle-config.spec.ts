const expect = require('chai').expect;

import SetupFlags from './setup-flags';

import HandleConfigFile from './handle-config';

interface ConfigurationParsedByCosmiconfig {
    config: string;
}

describe('Use-cases - Should find config file', () => {
    let program;

    beforeEach(() => {
        SetupFlags.setup({
            version: '0.0.1'
        });
        program = SetupFlags.program;
    });

    it('there is one, should find it with --config', async () => {
        program.config = './test/fixtures/todomvc-ng2/.compodocrc';
        const configExplorerResult = (await HandleConfigFile.handle(
            program
        )) as ConfigurationParsedByCosmiconfig;
        expect(configExplorerResult.config).to.have.key({
            output: 'test-config-file'
        });
    });

    it('there is no config file, should not find it', async () => {
        program.config = '';
        const configExplorerResult = await HandleConfigFile.handle(program);
        expect(configExplorerResult).to.be.null;
    });
});
