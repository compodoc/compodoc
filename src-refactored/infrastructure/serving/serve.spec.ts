import setupFlags from '../../core/use-cases/setup-flags';

import { CLIProgram } from '../../core/entities/cli-program';

import ConfigurationRepository from '../../core/repositories/config.repository';

import ServeService from './serve';

const request = require('supertest');

describe('Infrastructure - Serve files', () => {
    let server;

    before(() => {
        const currentProgram: CLIProgram = setupFlags.setup({
            version: '0.0.1'
        });

        ConfigurationRepository.init(currentProgram);

        ConfigurationRepository.internalConfiguration.output = 'src';

        server = ServeService.serve(ConfigurationRepository.internalConfiguration);
    });

    after(() => {
        server.close();
    });

    it('should serve with existing folder src/templates', () => {
        return request(server)
            .get('/templates/')
            .expect(200);
    });
});
