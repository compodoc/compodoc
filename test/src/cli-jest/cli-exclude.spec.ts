import { exists, shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI exclude from tsconfig', () => {
    const distFolder = tmp.name + '-exclude';

    describe('when specific files are excluded in tsconfig', () => {
        beforeEach(function(done) {
            tmp.create(distFolder);

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.exclude.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should not create files excluded', () => {
            let isFileExists = exists(`${distFolder}/components/BarComponent.html`);
            expect(isFileExists).toBeFalsy();
            isFileExists = exists(`${distFolder}/modules/BarModule.html`);
            expect(isFileExists).toBeFalsy();
        });
    });
});
