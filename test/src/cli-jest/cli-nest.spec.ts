import { exists, read, shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI nest projects support', () => {
    const distFolder = tmp.name + '-nest';

    describe('with simple app', () => {
        let indexFile;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/nest-app/tsconfig.json',
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

        it('it should contain a controller page', () => {
            let isFileExists = exists(`${distFolder}/controllers/AppController.html`);
            expect(isFileExists).toBeTruthy();
        });

        it('it should contain a controller page with prefix', () => {
            let file = read(`${distFolder}/controllers/AppController.html`);
            expect(file).toContain('@Auth(Roles.User)<br');
            expect(file).toContain('@Post()<br');
            expect(file).toContain('@UsePipes(new ValidationPipe())<br');
            expect(file).toContain(
                '@ApiResponse({description: &#x27;Return all articles.&#x27;})<br'
            );
            expect(file).toContain(`@Post(&#x27;multiple&#x27;)<br`);
            expect(file).toContain('The main app controller</p>');
        });

        it('it should contain a module page with controller referenced', () => {
            let isFileExists = exists(`${distFolder}/modules/AppModule.html`);
            expect(isFileExists).toBeTruthy();
            let file = read(`${distFolder}/modules/AppModule.html`);
            expect(file).toContain('AppController</a>');
        });

        it('it should contain an entity', () => {
            let isFileExists = exists(`${distFolder}/classes/UserEntity.html`);
            expect(isFileExists).toBeTruthy();
            let file = read(`${distFolder}/classes/UserEntity.html`);
            expect(file).toContain('@Column({default: &#x27;&#x27;})<br');
        });
    });
});
