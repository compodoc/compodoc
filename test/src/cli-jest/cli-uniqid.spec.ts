import { read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI Uniq id for file', () => {
    const distFolder = tmp.name + '-uniqid';

    let indexFile;
    beforeEach(function(done) {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/sample-files/tsconfig.simple.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        indexFile = read(`${distFolder}/js/menu-wc.js`);

        done();
    });
    afterEach(() => tmp.clean(distFolder));

    it('it should contain a uniqid', () => {
        expect(indexFile).toContain('6392bbbd114021b59c52f837ecd63c53');
    });
});
