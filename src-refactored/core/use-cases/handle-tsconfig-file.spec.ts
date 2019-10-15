const expect = require('chai').expect;
const sinon = require('sinon');

import { CLIProgram } from '../../core/entities/cli-program';
import ConfigurationRepository from '../../core/repositories/config.repository';

import Logger from '../../infrastructure/logging/logger';

import SetupFlags from './setup-flags';

import HandleTsconfigFile from './handle-tsconfig-file';

describe('Use-cases - Should find tsconfig file', () => {
    let loggerStubInfo;
    let loggerStubError;

    beforeEach(() => {
        loggerStubInfo = sinon.stub(Logger, 'info');
        loggerStubError = sinon.stub(Logger, 'error');

        const currentProgram: CLIProgram = SetupFlags.setup({
            version: '0.0.1'
        });

        ConfigurationRepository.init(currentProgram);
    });

    it('with file provided with -p flag, handle it', async () => {
        ConfigurationRepository.internalConfiguration.tsconfig =
            'test/fixtures/sample-files/tsconfig.exclude.json';

        const tsconfigExplorerResult = await HandleTsconfigFile.handle();
        expect(tsconfigExplorerResult).to.be.an('object');
    });

    afterEach(() => {
        loggerStubInfo.restore();
        loggerStubError.restore();
    });

    it('with file provided with -p flag, handle it, and log with found it', async () => {
        const testfilePath = 'test/fixtures/sample-files/tsconfig.exclude.json';
        ConfigurationRepository.internalConfiguration.tsconfig = testfilePath;

        await HandleTsconfigFile.handle();
        sinon.assert.calledWithExactly(
            Logger.info,
            sinon.match(`Using tsconfig file : ${testfilePath}`)
        );
    });

    it('with bad path for file provided with -p flag, log we did not found it', async () => {
        const testfilePath = 'test/fixtures/sample-files/notsconfig.json';
        ConfigurationRepository.internalConfiguration.tsconfig = testfilePath;

        try {
            await HandleTsconfigFile.handle();
        } catch (e) {
            expect(e).equal(`${testfilePath} file was not found in the current directory`);
        }
    });

    it('with one tsconfig file, find exclude, include and files', async () => {
        ConfigurationRepository.internalConfiguration.tsconfig =
            'test/fixtures/sample-files/tsconfig.exclude.json';

        let tsconfigExplorerResult = await HandleTsconfigFile.handle();

        expect(tsconfigExplorerResult).to.have.property('exclude');
        expect(tsconfigExplorerResult['exclude']).to.have.members([
            'bar.component.ts',
            '*.module.ts'
        ]);

        ConfigurationRepository.internalConfiguration.tsconfig =
            'test/fixtures/sample-files/tsconfig.include-file.json';

        tsconfigExplorerResult = await HandleTsconfigFile.handle();

        expect(tsconfigExplorerResult).to.have.property('include');
        expect(tsconfigExplorerResult['include']).to.have.members(['bar.component.ts']);

        ConfigurationRepository.internalConfiguration.tsconfig =
            'test/fixtures/sample-files/tsconfig.entry.json';

        tsconfigExplorerResult = await HandleTsconfigFile.handle();

        expect(tsconfigExplorerResult).to.have.property('files');
        expect(tsconfigExplorerResult['files']).to.have.members([
            'app.module.ts',
            'foo.component.ts',
            'foo.module.ts'
        ]);
    });
});
