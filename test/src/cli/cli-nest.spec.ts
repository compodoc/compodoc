import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir();

describe('CLI nest projects support', () => {

    const distFolder = tmp.name + '-nest';

    describe('with simple app', () => {

        let indexFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/nest-app/tsconfig.json',
                '-d', distFolder]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should contain a controller page', () => {
            let isFileExists = exists(`${distFolder}/controllers/AppController.html`);
            expect(isFileExists).to.be.true;
        });

        it('it should contain a controller page with prefix', () => {
            let file = read(`${distFolder}/controllers/AuthController.html`);
            expect(file).to.contain('code>auth</code');
            expect(file).to.contain('code>@Auth(Roles.User) @Post() </code');
            expect(file).to.contain(`code>@Post('multiple') </code`);
        });

        it('it should contain a module page with controller referenced', () => {
            let isFileExists = exists(`${distFolder}/modules/AppModule.html`);
            expect(isFileExists).to.be.true;
            let file = read(`${distFolder}/modules/AppModule.html`);
            expect(file).to.contain('AppController</a>');
        });

    });
});
