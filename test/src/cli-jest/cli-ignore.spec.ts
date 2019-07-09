import { exists, read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI ignore JSDoc tag support', () => {
    const distFolder = tmp.name + '-ignore-jsdoc';

    describe('without --disableLifeCycleHooks', () => {
        beforeEach(done => {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2-ignore/src/tsconfig.json',
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

        it('AppComponent ignored', () => {
            const file = exists(distFolder + '/components/AppComponent.html');
            expect(file).toBeFalsy();
        });

        it('Component property ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>ignoredProperty'));
        });

        it('Component function ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>ignoredFunction'));
        });

        it('Component input ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>ignoredInput'));
        });

        it('Component output ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>ignoredOutput'));
        });

        it('Component hostbinding ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>style.color'));
        });

        it('Component hostlistener ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>mouseup'));
        });

        it('Module ignored', () => {
            const file = exists(distFolder + '/modules/FooterModule.html');
            expect(file).toBeFalsy();
        });

        it('Directive ignored', () => {
            const file = exists(distFolder + '/directives/DoNothingDirective.html');
            expect(file).toBeFalsy();
        });

        it('Service ignored', () => {
            const file = exists(distFolder + '/services/TodoStore.html');
            expect(file).toBeFalsy();
        });

        it('Pipe ignored', () => {
            const file = exists(distFolder + '/pipes/FirstUpperPipe.html');
            expect(file).toBeFalsy();
        });

        it('Interface ignored', () => {
            const file = exists(distFolder + '/interfaces/ClockInterface.html');
            expect(file).toBeFalsy();
        });

        it('Class ignored', () => {
            const file = exists(distFolder + '/classes/Todo.html');
            expect(file).toBeFalsy();
        });

        it('Class constructor ignored', () => {
            const file = read(distFolder + '/classes/PrivateConstructor.html');
            expect(file).toEqual(expect.not.stringContaining('<code>constructor'));
        });

        it('Class property ignored', () => {
            const file = read(distFolder + '/classes/PrivateConstructor.html');
            expect(file).toEqual(expect.not.stringContaining('<code>myproperty'));
        });

        it('Class function ignored', () => {
            const file = read(distFolder + '/classes/PrivateConstructor.html');
            expect(file).toEqual(expect.not.stringContaining('<code>yo'));
        });

        it('Class acessors ignored', () => {
            const file = read(distFolder + '/components/FooterComponent.html');
            expect(file).toEqual(expect.not.stringContaining('<code>title(v'));
        });

        it('Simple function ignored', () => {
            const file = read(distFolder + '/miscellaneous/functions.html');
            expect(file).toEqual(expect.not.stringContaining('<code>LogMethod'));
        });

        it('Simple enum ignored', () => {
            const file = read(distFolder + '/miscellaneous/enumerations.html');
            expect(file).toEqual(expect.not.stringContaining('<a href="#Direction">'));
        });

        it('Simple variable ignored', () => {
            const file = read(distFolder + '/miscellaneous/variables.html');
            expect(file).toEqual(expect.not.stringContaining('<code>PIT'));
        });

        it('Simple type alias ignored', () => {
            const file = read(distFolder + '/miscellaneous/typealiases.html');
            expect(file).toEqual(expect.not.stringContaining('<code>ChartChange'));
        });
    });

    describe('with --disableLifeCycleHooks', () => {
        beforeEach(done => {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2-ignore/src/tsconfig.json',
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
        afterEach(() => tmp.clean(distFolder));

        it('AppComponent ignored', () => {
            const file = exists(distFolder + '/components/AppComponent.html');
            expect(file).toBeFalsy();
        });

        it('Directive ignored', () => {
            const file = exists(distFolder + '/directives/DoNothingDirective.html');
            expect(file).toBeFalsy();
        });
    });
});
