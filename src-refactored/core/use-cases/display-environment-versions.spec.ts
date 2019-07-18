import { ts } from 'ts-morph';

import Logger from '../../infrastructure/logging/logger';
import DisplayEnvironmentVersions from './display-environment-versions';

describe('Display informations', () => {
    let outputData = '';
    const storeLog = inputs => (outputData += inputs);
    console['log'] = jest.fn(storeLog);

    beforeEach(() => {
        outputData = '';
    });

    it('without --silent', async () => {
        DisplayEnvironmentVersions.display({
            version: '3.4.0'
        });
        expect(outputData).toContain('3.4.0');
        expect(outputData).toContain(`TypeScript version used by Compodoc : ${ts.version}`);
        expect(outputData).toContain('Node.js version');
        expect(outputData).toContain('Operating system');
    });

    it('with --silent', async () => {
        Logger.silent = true;
        DisplayEnvironmentVersions.display({
            version: '3.4.0'
        });
        expect(outputData).toContain('Compodoc v3.4.0');
    });

    it('with real project', async () => {
        Logger.silent = false;
        process.chdir('./test/fixtures/todomvc-ng2');
        DisplayEnvironmentVersions.display({
            version: '3.4.0'
        });
        expect(outputData).toContain('TypeScript version of current project : 3.1.1');
    });
});
