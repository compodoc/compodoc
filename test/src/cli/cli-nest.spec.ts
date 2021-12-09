import * as chai from 'chai';
import { temporaryDir, shell, exists, read } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI nest projects support', () => {
    const distFolder = tmp.name + '-nest';

    describe('with simple app', () => {
        before(function (done) {
            tmp.create(distFolder);
            const ls = shell('node', [
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
            const isFileExists = exists(`${distFolder}/controllers/AppController.html`);
            expect(isFileExists).to.be.true;
        });

        it('it should contain a controller page with prefix', () => {
            const file = read(`${distFolder}/controllers/AppController.html`);
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
            const isFileExists = exists(`${distFolder}/modules/AppModule.html`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/modules/AppModule.html`);
            expect(file).to.contain('AppController</a>');
        });

        it('it should contain an entity with all properties and decorators', () => {
            const isFileExists = exists(`${distFolder}/entities/UserEntity.html`);
            expect(isFileExists).to.be.true;
            const file = read(`${distFolder}/entities/UserEntity.html`);
            expect(file).to.contain('@Column({default: &#x27;&#x27;})<br');
            expect(file).to.contain('@OneToMany(type &#x3D;&gt; ArticleEntity');
            expect(file).to.contain(
                '@OneToMany(type &#x3D;&gt; ArticleEntity, article &#x3D;&gt; article.author)'
            );
        });
    });
});
