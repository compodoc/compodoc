import { expect } from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const tmp = temporaryDir();

describe('CLI simple generation - extends app', () => {
    let stdoutString = undefined;

    let appComponentFile, myInitialClassFile;

    const distFolder = tmp.name + '-big-app-extends';

    before(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/sample-files-extends/src/tsconfig.json',
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
    after(() => tmp.clean(distFolder));

    it('AppComponent extends AnotherComponent', () => {
        expect(appComponentFile).to.contain('myprop');
        expect(appComponentFile).to.contain('ngOnInit');
        expect(appComponentFile).to.contain('myoutput');
        expect(appComponentFile).to.contain('itisme');
    });

    it('DoNothingDirective extends ADirective', () => {
        const file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.contain('Extends');
        expect(file).to.contain(
            '<a href="../directives/ADirective.html" target="_self" >ADirective'
        );
    });

    it('MyInitialClass extends SubClassA', () => {
        expect(myInitialClassFile).to.contain('meh');
        expect(myInitialClassFile).to.contain('myproperty');
    });

    it('FirstClass extends BSecondClass extends AThirdClass', () => {
        const FirstClassFile = read(`${distFolder}/classes/FirstClass.html`);
        expect(FirstClassFile).to.contain('BSecondClass:4');
        expect(FirstClassFile).to.contain('AThirdClass:2');
    });

    it('CharactersService extends AbstractService', () => {
        const file = read(distFolder + '/injectables/CharactersService.html');
        expect(file).to.contain(
            'code><a href="../injectables/AbstractService.html" target="_self" >AbstractService'
        );
    });

    it('ClockInterface multiple extends', () => {
        const file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).to.contain(
            'code><a href="../interfaces/TimeInterface.html" target="_self" >TimeInterface'
        );
        expect(file).to.contain(
            'code><a href="../interfaces/BooInterface.html" target="_self" >BooInterface'
        );
    });
});
