import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI generation - TypeDoc examples', () => {
    let stdoutString = undefined;
    const distFolder = tmp.name + '-typedoc';

    before(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/typedoc-examples/tsconfig.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        done();
    });
    after(() => tmp.clean(distFolder));

    it('should display generated message', () => {
        expect(stdoutString).to.contain('Documentation generated');
    });

    it('interfaces - INameInterface', () => {
        const file = read(`${distFolder}/interfaces/INameInterface.html`);
        expect(file, 'Did not contain class comment').to.contain('This is a simple interface.');
        expect(file, 'Did not contain function commment').to.contain(
            'This is a interface function of INameInterface.'
        );
        expect(file, 'Did not contain member comment').to.contain(
            'This is a interface member of INameInterface.'
        );
    });

    it('interfaces - IPrintNameInterface', () => {
        const file = read(`${distFolder}/interfaces/IPrintNameInterface.html`);
        expect(file).to.contain('This is a interface inheriting from two other interfaces.');
        expect(file).to.contain('This is a interface function of IPrintNameInterface');
        expect(file).to.contain('Extends');
    });

    it('classes - BaseClass', () => {
        const file = read(`${distFolder}/classes/BaseClass.html`);
        expect(file).to.contain('This is a simple base class.');
        expect(file).to.contain('Implements');
        expect(file).to.contain('This is a private function.');
    });
});
