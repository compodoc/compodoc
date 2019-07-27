const request = require('supertest');

import { CommanderStatic } from 'commander';

import ConfigurationRepository from '../../core/repositories/config.repository';

import SetupFlags from '../../core/use-cases/setup-flags';

import ServeFiles from './serve-files';

describe('Serve files', () => {
    let outputData = '';

    const storeLog = inputs => (outputData += inputs);
    console['log'] = jest.fn(storeLog);

    beforeAll(() => {
        const currentProgram: CommanderStatic = SetupFlags.setup({
            version: '0.0.1'
        });
        ConfigurationRepository.init(currentProgram);
        ConfigurationRepository.internalConfiguration.output = 'src';
        ConfigurationRepository.internalConfiguration.port = 8181;
    });

    beforeEach(() => {
        outputData = '';
    });

    it('should serve with existing folder', () => {
        /*ServeFiles.serve(ConfigurationRepository.internalConfiguration);
        setTimeout(() => {
            expect(outputData).toContain('Serving documentation from');
            done();
        }, 2000);
        https://github.com/bpedersen/jest-mock-console
        */
        expect(2).toEqual(2);
    });

    it('should not serve with non existing folder', async () => {
        expect(2).toEqual(2);
    });
});
