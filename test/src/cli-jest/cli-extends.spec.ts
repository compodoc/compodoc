import { read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI simple generation - extends app', () => {
    let stdoutString = undefined;

    let appComponentFile, myInitialClassFile;

    const distFolder = tmp.name + '-big-app-extends';

    beforeAll(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/sample-files-extends/src/tsconfig.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        appComponentFile = read(`${distFolder}/components/AppComponent.html`);
        myInitialClassFile = read(`${distFolder}/classes/MyInitialClass.html`);
        done();
    });
    afterAll(() => tmp.clean(distFolder));

    it('AppComponent extends AnotherComponent', () => {
        expect(appComponentFile).toContain('myprop');
        expect(appComponentFile).toContain('ngOnInit');
        expect(appComponentFile).toContain('myoutput');
        expect(appComponentFile).toContain('itisme');
    });

    it('MyInitialClass extends SubClassA', () => {
        expect(myInitialClassFile).toContain('meh');
        expect(myInitialClassFile).toContain('myproperty');
    });

    it('FirstClass extends BSecondClass extends AThirdClass', () => {
        const FirstClassFile = read(`${distFolder}/classes/FirstClass.html`);
        expect(FirstClassFile).toContain('BSecondClass:4');
        expect(FirstClassFile).toContain('AThirdClass:2');
    });

    it('CharactersService extends AbstractService', () => {
        let file = read(distFolder + '/injectables/CharactersService.html');
        expect(file).toContain(
            'code><a href="../injectables/AbstractService.html" target="_self" >AbstractService'
        );
    });
});
