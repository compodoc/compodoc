const request = require('supertest');

import { CommanderStatic } from 'commander';

import ConfigurationRepository from '../../core/repositories/config.repository';

import SetupFlags from '../../core/use-cases/setup-flags';

import ServeService from './serve';

describe('ServeService', () => {
    let server;

    beforeAll(done => {
        const currentProgram: CommanderStatic = SetupFlags.setup({
            version: '0.0.1'
        });
        ConfigurationRepository.init(currentProgram);
        ConfigurationRepository.internalConfiguration.output = 'src';
        server = ServeService.serve(ConfigurationRepository.internalConfiguration);
        setTimeout(() => {
            done();
        }, 1000);
    });

    afterAll(() => {
        server.close();
    });

    it('should serve with existing folder', done => {
        request(server)
            .get('/')
            .expect(200, done);
    });
});
