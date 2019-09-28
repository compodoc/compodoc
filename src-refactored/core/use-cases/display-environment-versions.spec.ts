import { ts } from 'ts-morph';

const sinon = require('sinon');

import Logger from '../../infrastructure/logging/logger';
import DisplayEnvironmentVersions from './display-environment-versions';

describe('Display informations', () => {
    let consoleStubLog;

    beforeEach(() => {
        consoleStubLog = sinon.stub(console, 'log');
    });

    afterEach(() => {
        consoleStubLog.restore();
    });

    after(() => {
        process.chdir('../../../');
    });

    it('without --silent', async () => {
        DisplayEnvironmentVersions.display({
            version: '3.4.0'
        });
        sinon.assert.calledWith(console.log, '3.4.0');
        sinon.assert.calledWith(console.log, sinon.match('Node.js version'));
        sinon.assert.calledWith(
            console.log,
            sinon.match(`TypeScript version used by Compodoc : ${ts.version}`)
        );
        sinon.assert.calledWith(console.log, sinon.match('Operating system'));
    });

    it('with --silent', async () => {
        Logger.silent = true;
        DisplayEnvironmentVersions.display({
            version: '3.4.0'
        });
        sinon.assert.calledWithExactly(console.log, 'Compodoc v3.4.0');
    });

    it('with real project', async () => {
        Logger.silent = false;
        process.chdir('./test/fixtures/todomvc-ng2');
        DisplayEnvironmentVersions.display({
            version: '3.4.0'
        });
        sinon.assert.calledWithExactly(
            console.log,
            'TypeScript version of current project : 3.1.1'
        );
    });
});
