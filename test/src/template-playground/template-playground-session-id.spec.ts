import * as fs from 'fs-extra';
import * as path from 'path';
import { expect } from 'chai';
import { TemplatePlaygroundServer } from '../../../src/template-playground/template-playground-server';

describe('TemplatePlaygroundServer session IDs', () => {
    let server: TemplatePlaygroundServer;
    let testDir: string;
    let originalCwd: string;

    beforeEach(async () => {
        originalCwd = process.cwd();
        testDir = path.join(process.cwd(), 'test-temp-session-id');

        await fs.ensureDir(path.join(testDir, 'src', 'playground-demo'));
        await fs.ensureDir(path.join(testDir, 'src', 'templates'));

        process.chdir(testDir);
        server = new TemplatePlaygroundServer();
    });

    afterEach(async () => {
        if (server) {
            await server.stop();
        }

        process.chdir(originalCwd);
        await fs.remove(testDir);
    });

    it('should reuse random session IDs for a client IP without deriving them from the IP', () => {
        const createOrGetSessionByIP = (server as any).createOrGetSessionByIP.bind(server);
        const legacyIPDerivedSessionId = '36f28974db5d9ea3219607fdd6ecfc56';

        const firstSession = createOrGetSessionByIP('192.0.2.10');
        const repeatedSession = createOrGetSessionByIP('192.0.2.10');
        const otherSession = createOrGetSessionByIP('192.0.2.11');

        expect(firstSession.id).to.equal(repeatedSession.id);
        expect(firstSession.id).to.match(/^[a-f0-9]{32}$/);
        expect(firstSession.id).not.to.equal(legacyIPDerivedSessionId);
        expect(otherSession.id).to.match(/^[a-f0-9]{32}$/);
        expect(otherSession.id).not.to.equal(firstSession.id);
    });
});
