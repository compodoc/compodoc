import Logger from './logger';

import * as log from 'loglevel';

describe('Display informations', () => {
    it('with log', async () => {
        jest.spyOn(log, 'debug').mockImplementation();
        Logger.log('log information');
        expect(log.debug).toHaveBeenCalledTimes(1);
    });
    it('with debug', async () => {
        jest.spyOn(log, 'debug').mockImplementation();
        Logger.debug('debug information');
        expect(log.debug).toHaveBeenCalledTimes(2);
    });
    it('with info', async () => {
        jest.spyOn(log, 'info').mockImplementation();
        Logger.info('info information');
        expect(log.info).toHaveBeenCalledTimes(1);
    });
    it('with warn', async () => {
        jest.spyOn(log, 'warn').mockImplementation();
        Logger.warn('warn information');
        expect(log.warn).toHaveBeenCalledTimes(1);
    });
    it('with error', async () => {
        jest.spyOn(log, 'error').mockImplementation();
        Logger.error('error information');
        expect(log.error).toHaveBeenCalledTimes(1);
    });
});

describe(`Doesn't display informations`, () => {
    beforeAll(() => {
        Logger.silent = true;
        jest.clearAllMocks();
    });
    it('with log', async () => {
        jest.spyOn(log, 'debug').mockImplementation();
        Logger.log('log information');
        expect(log.debug).toHaveBeenCalledTimes(0);
    });
    it('with debug', async () => {
        jest.spyOn(log, 'debug').mockImplementation();
        Logger.debug('debug information');
        expect(log.debug).toHaveBeenCalledTimes(0);
    });
    it('with info', async () => {
        jest.spyOn(log, 'info').mockImplementation();
        Logger.info('info information');
        expect(log.info).toHaveBeenCalledTimes(0);
    });
    it('with warn', async () => {
        jest.spyOn(log, 'warn').mockImplementation();
        Logger.warn('warn information');
        expect(log.warn).toHaveBeenCalledTimes(0);
    });
    it('with error', async () => {
        jest.spyOn(log, 'error').mockImplementation();
        Logger.error('error information');
        expect(log.error).toHaveBeenCalledTimes(0);
    });
});
