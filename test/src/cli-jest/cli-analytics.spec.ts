import { read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI Analytics tracking', () => {
    const distFolder = tmp.name + '-tracking';

    describe('add tracking code', () => {
        let coverageFile;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--gaID',
                'UA-XXXXX-Y',
                '--gaSite',
                'demo',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            coverageFile = read(`${distFolder}/index.html`);
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('it should contain tracking code', () => {
            expect(coverageFile).toContain('www.google-analytics.com');
            expect(coverageFile).toContain('demo');
        });
    });
});
