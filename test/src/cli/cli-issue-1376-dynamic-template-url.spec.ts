import { expect } from 'chai';
import { temporaryDir, shell, exists, read } from '../helpers';

const tmp = temporaryDir();

describe('CLI issue #1376 - dynamic templateUrl path', () => {
    const distFolder = tmp.name + '-issue-1376-dynamic-template-url';
    let stdoutString = undefined;
    let componentFile = '';

    before(function (done) {
        tmp.create(distFolder);
        const ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/issue1376-dynamic-template-url/tsconfig.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
            return;
        }

        stdoutString = ls.stdout.toString();
        componentFile = read(`${distFolder}/components/AppComponent.html`);
        done();
    });

    after(() => tmp.clean(distFolder));

    it('should generate documentation successfully', () => {
        expect(exists(distFolder)).to.be.true;
        expect(stdoutString).to.contain('Documentation generated');
    });

    it('should resolve templateUrl from imported object property access', () => {
        expect(stdoutString).to.not.contain('Cannot read template for AppComponent');
        expect(componentFile).to.contain('dynamic-template-url-marker');
    });
});
