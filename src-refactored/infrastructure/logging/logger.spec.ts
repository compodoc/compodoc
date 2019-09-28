const sinon = require('sinon');

import Logger from './logger';

import * as log from 'loglevel';

describe('Display informations', () => {
    let logStubDebug;
    let logStubInfo;
    let logStubWarn;
    let logStubError;

    beforeEach(() => {
        logStubDebug = sinon.stub(log, 'debug');
        logStubInfo = sinon.stub(log, 'info');
        logStubWarn = sinon.stub(log, 'warn');
        logStubError = sinon.stub(log, 'error');
    });

    afterEach(() => {
        logStubDebug.restore();
        logStubInfo.restore();
        logStubWarn.restore();
        logStubError.restore();
    });

    it('with log', async () => {
        Logger.log('log information');
        sinon.assert.calledOnce(log.debug);
    });
    it('with debug', async () => {
        Logger.debug('debug information');
        sinon.assert.calledOnce(log.debug);
    });
    it('with info', async () => {
        Logger.info('info information');
        sinon.assert.calledOnce(log.info);
    });
    it('with warn', async () => {
        Logger.warn('warn information');
        sinon.assert.calledOnce(log.warn);
    });
    it('with error', async () => {
        Logger.error('error information');
        sinon.assert.calledOnce(log.error);
    });
});

describe(`Doesn't display informations`, () => {
    let logStubDebug;
    let logStubInfo;
    let logStubWarn;
    let logStubError;

    beforeEach(() => {
        logStubDebug = sinon.stub(log, 'debug');
        logStubInfo = sinon.stub(log, 'info');
        logStubWarn = sinon.stub(log, 'warn');
        logStubError = sinon.stub(log, 'error');
    });

    afterEach(() => {
        logStubDebug.restore();
        logStubInfo.restore();
        logStubWarn.restore();
        logStubError.restore();
    });

    before(() => {
        Logger.silent = true;
    });
    it('with log', async () => {
        Logger.log('log information');
        sinon.assert.notCalled(log.debug);
    });
    it('with debug', async () => {
        Logger.debug('debug information');
        sinon.assert.notCalled(log.debug);
    });
    it('with info', async () => {
        Logger.info('info information');
        sinon.assert.notCalled(log.info);
    });
    it('with warn', async () => {
        Logger.warn('warn information');
        sinon.assert.notCalled(log.warn);
    });
    it('with error', async () => {
        Logger.error('error information');
        sinon.assert.notCalled(log.error);
    });
});
