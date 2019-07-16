import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI nest projects support', () => {
    const distFolder = tmp.name + '-nest';

    describe('with simple app', () => {
        let indexFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/nest-app/tsconfig.json',
                '-d',
                distFolder
            ]);

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
            let file = read(`${distFolder}/controllers/AppController.html`);
            expect(file).to.contain('@Auth(Roles.User)<br');
            expect(file).to.contain('@Post()<br');
            expect(file).to.contain('@UsePipes(new ValidationPipe())<br');
            expect(file).to.contain(
                '@ApiResponse({description: &#x27;Return all articles.&#x27;})<br'
            );
            expect(file).to.contain(`@Post(&#x27;multiple&#x27;)<br`);
            expect(file).to.contain('The main app controller</p>');
        });

        it('it should contain a module page with controller referenced', () => {
            let isFileExists = exists(`${distFolder}/modules/AppModule.html`);
            expect(isFileExists).to.be.true;
            let file = read(`${distFolder}/modules/AppModule.html`);
            expect(file).to.contain('AppController</a>');
        });

        it('it should contain an entity', () => {
            let isFileExists = exists(`${distFolder}/classes/UserEntity.html`);
            expect(isFileExists).to.be.true;
            let file = read(`${distFolder}/classes/UserEntity.html`);
            expect(file).to.contain('@Column({default: &#x27;&#x27;})<br');
        });
    });
});
