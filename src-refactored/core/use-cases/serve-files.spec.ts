import SetupFlags from '../../core/use-cases/setup-flags';

import { CLIProgram } from '../../core/entities/cli-program';

import ConfigurationRepository from '../../core/repositories/config.repository';

import ServeFiles from './serve-files';
import Logger from '../../infrastructure/logging/logger';

const sinon = require('sinon');

describe('Use-cases - Serve files', () => {
    let loggerStubInfo;

    before(() => {
        const currentProgram: CLIProgram = SetupFlags.setup({
            version: '0.0.1'
        });

        ConfigurationRepository.init(currentProgram);

        ConfigurationRepository.internalConfiguration.output = 'src';
        ConfigurationRepository.internalConfiguration.port = 8181;

        loggerStubInfo = sinon.stub(Logger, 'info');

        ServeFiles.serve(ConfigurationRepository.internalConfiguration);
    });

    after(() => {
        loggerStubInfo.restore();
        ServeFiles.stop();
    });

    it('should log informations about serve', () => {
        sinon.assert.calledWith(Logger.info, sinon.match('Serving documentation from'));
    });
});
