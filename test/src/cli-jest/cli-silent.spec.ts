import { shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI simple flags', () => {
    const distFolder = tmp.name + '-silent';
    let stdoutString = '';

    beforeEach(function(done) {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/sample-files/tsconfig.simple.json',
            '-d',
            distFolder,
            '--silent'
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        done();
    });
    afterEach(() => tmp.clean(distFolder));

    it('should display simple message', () => {
        expect(stdoutString).toContain('Compodoc v');
        expect(stdoutString).toEqual(
            expect.not.stringContaining('TypeScript version used by Compodoc')
        );
    });
});
