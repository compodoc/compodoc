import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI ignore JSDoc tag support', () => {
    const distFolder = tmp.name + '-ignore-jsdoc';

    describe('without --disableLifeCycleHooks', () => {
        before(done => {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-ignore/src/tsconfig.json',
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

        it('AppComponent ignored', () => {
            const file = exists(distFolder + '/components/AppComponent.html');
            expect(file).to.be.false;
        });

        it('Component property ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>ignoredProperty');
        });

        it('Component function ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>ignoredFunction');
        });

        it('Component input ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>ignoredInput');
        });

        it('Component output ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>ignoredOutput');
        });

        it('Component hostbinding ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>style.color');
        });

        it('Component hostlistener ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>mouseup');
        });

        it('Module ignored', () => {
            const file = exists(distFolder + '/modules/FooterModule.html');
            expect(file).to.be.false;
        });

        it('Directive ignored', () => {
            const file = exists(distFolder + '/directives/DoNothingDirective.html');
            expect(file).to.be.false;
        });

        it('Service ignored', () => {
            const file = exists(distFolder + '/services/TodoStore.html');
            expect(file).to.be.false;
        });

        it('Pipe ignored', () => {
            const file = exists(distFolder + '/pipes/FirstUpperPipe.html');
            expect(file).to.be.false;
        });

        it('Interface ignored', () => {
            const file = exists(distFolder + '/interfaces/ClockInterface.html');
            expect(file).to.be.false;
        });

        it('Class ignored', () => {
            const file = exists(distFolder + '/classes/Todo.html');
            expect(file).to.be.false;
        });

        it('Class constructor ignored', () => {
            const file = read(distFolder + '/classes/PrivateConstructor.html');
            expect(file).to.not.contain('<code>constructor');
        });

        it('Class property ignored', () => {
            const file = read(distFolder + '/classes/PrivateConstructor.html');
            expect(file).to.not.contain('<code>myproperty');
        });

        it('Class function ignored', () => {
            const file = read(distFolder + '/classes/PrivateConstructor.html');
            expect(file).to.not.contain('<code>yo');
        });

        it('Class acessors ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).to.not.contain('<code>title(v');
        });

        it('Simple function ignored', () => {
            const file = read(distFolder + '/miscellaneous/functions.html');
            expect(file).to.not.contain('<code>LogMethod');
        });

        it('Simple enum ignored', () => {
            const file = read(distFolder + '/miscellaneous/enumerations.html');
            expect(file).to.not.contain('<a href="#Direction">');
        });

        it('Simple variable ignored', () => {
            const file = read(distFolder + '/miscellaneous/variables.html');
            expect(file).to.not.contain('<code>PIT');
        });

        it('Simple type alias ignored', () => {
            const file = read(distFolder + '/miscellaneous/typealiases.html');
            expect(file).to.not.contain('<code>ChartChange');
        });
    });

    describe('with --disableLifeCycleHooks', () => {
        before(done => {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/todomvc-ng2-ignore/src/tsconfig.json',
                '--disableLifeCycleHooks',
                '-d',
                distFolder
            ]);

            if (ls.stdout.toString().indexOf('Sorry') !== -1) {
                console.error(`shell error: ${ls.stdout.toString()}`);
                done('error');
            }

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('AppComponent ignored', () => {
            const file = exists(distFolder + '/components/AppComponent.html');
            expect(file).to.be.false;
        });

        it('Directive ignored', () => {
            const file = exists(distFolder + '/directives/DoNothingDirective.html');
            expect(file).to.be.false;
        });
    });
});
