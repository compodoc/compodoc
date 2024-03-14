import { expect } from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const tmp = temporaryDir();

describe('CLI Deprecated', () => {
    const tmpFolder = tmp.name + '-deprecated';
    const distFolder = tmpFolder + '/documentation';

    let menuFile;

    describe('Angular app', () => {
        before(function (done) {
            tmp.create(tmpFolder);
            tmp.copy('./test/fixtures/todomvc-ng2-deprecated/', tmpFolder);
            let ls = shell(
                'node',
                ['../bin/index-cli.js', '-p', './tsconfig.doc.json', '-d', 'documentation'],
                { cwd: tmpFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }

            menuFile = read(`${distFolder}/js/menu-wc.js`);

            done();
        });
        after(() => tmp.clean(tmpFolder));

        it('it should contain module deprecated', () => {
            const file = read(`${distFolder}/modules/AboutModule2.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">AboutModule2'
            );
        });

        it('it should contain injectable deprecated and one API inside', () => {
            const file = read(`${distFolder}/injectables/TodoStore.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(file).to.contain('class="deprecated-name">getThemAll');
            expect(menuFile).to.contain(
                'data-context-id="modules" class="deprecated-name">TodoStore'
            );
        });

        it('it should contain component deprecated and APIs inside', () => {
            const file = read(`${distFolder}/components/DumbComponent.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(file).to.contain('class="deprecated-name">emptyOutput');
            expect(file).to.contain('class="deprecated-name">emptyInput');
            expect(file).to.contain('class="deprecated-name">emptyHostBinding');
            expect(file).to.contain('class="deprecated-name">onMouseup');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">DumbComponent'
            );
        });

        it('it should contain directive deprecated and APIs inside', () => {
            const file = read(`${distFolder}/directives/DoNothingDirective2.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(file).to.contain('class="deprecated-name">popover');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">DoNothingDirective2'
            );
        });

        it('it should contain class deprecated and APIs inside', () => {
            const file = read(`${distFolder}/classes/Tidi.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(file).to.contain('class="deprecated-name">completed');
            expect(menuFile).to.contain('data-type="entity-link" class="deprecated-name">Tidi');
        });

        it('it should contain interceptor deprecated and APIs inside', () => {
            const file = read(`${distFolder}/interceptors/NoopInterceptor.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">NoopInterceptor'
            );
        });

        it('it should contain guard deprecated and APIs inside', () => {
            const file = read(`${distFolder}/guards/NotAuthGuard.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">NotAuthGuard'
            );
        });

        it('it should contain interface deprecated and APIs inside', () => {
            const file = read(`${distFolder}/interfaces/IDATA.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(file).to.contain('deprecated-name"><b>value');
            expect(menuFile).to.contain('data-type="entity-link" class="deprecated-name">IDATA');
        });

        it('it should contain pipe deprecated and APIs inside', () => {
            const file = read(`${distFolder}/pipes/FirstUpperPipe2.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">FirstUpperPipe2'
            );
        });

        it('it should contain enum deprecated and APIs inside', () => {
            const file = read(`${distFolder}/miscellaneous/enumerations.html`);
            expect(file).to.contain('deprecated-name"><b>Direction');
        });

        it('it should contain function deprecated and APIs inside', () => {
            const file = read(`${distFolder}/miscellaneous/functions.html`);
            expect(file).to.contain('deprecated-name"><b>foo2');
        });

        it('it should contain type deprecated and APIs inside', () => {
            const file = read(`${distFolder}/miscellaneous/typealiases.html`);
            expect(file).to.contain('deprecated-name"><b>LinearDomain');
        });

        it('it should contain variable deprecated and APIs inside', () => {
            const file = read(`${distFolder}/miscellaneous/variables.html`);
            expect(file).to.contain('deprecated-name"><b>PIT');
        });
    });

    describe('Nestjs app', () => {
        before(function (done) {
            tmp.clean(tmpFolder);
            tmp.copy('./test/fixtures/nest-app/', tmpFolder);
            let ls = shell(
                'node',
                ['../bin/index-cli.js', '-p', './tsconfig.json', '-d', 'documentation'],
                { cwd: tmpFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }

            menuFile = read(`${distFolder}/js/menu-wc.js`);

            done();
        });
        after(() => tmp.clean(tmpFolder));

        it('it should contain controller deprecated', () => {
            const file = read(`${distFolder}/controllers/AuthDeprecatedController.html`);
            expect(file).to.contain('<h3 class="deprecated">Deprecated');
            expect(menuFile).to.contain(
                'data-type="entity-link" class="deprecated-name">AuthDeprecatedController'
            );
        });
    });
});
