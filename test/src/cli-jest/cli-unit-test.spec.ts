import { exists, exec, pkg, read, shell, shellAsync, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI Unit Test Report', () => {
    const distFolder = tmp.name + '-unit-test';

    describe('full path in JSON', () => {
        let stdoutString = undefined,
            unitTestFile;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '--unitTestCoverage',
                './test/src/todomvc-ng2/coverage-summary.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).toContain('Unit test coverage');
            expect(unitTestFile).toContain('<span class="coverage-count">(22/26)</span>');
        });

        it('should have badges', () => {
            expect(unitTestFile).toContain('img src="./images/coverage-badge-statements.svg"');
            expect(unitTestFile).toContain('img src="./images/coverage-badge-branches.svg"');
            expect(unitTestFile).toContain('img src="./images/coverage-badge-functions.svg"');
            expect(unitTestFile).toContain('img src="./images/coverage-badge-lines.svg"');
        });

        it('should have full file path links', () => {
            expect(unitTestFile).toContain(
                '<a href="./components/AppComponent.html">test/src/todomvc-ng2/src/app/app.component.ts</a>'
            );
            expect(unitTestFile).toContain(
                '<a href="./components/AboutComponent.html">test/src/todomvc-ng2/src/app/about/about.component.ts</a>'
            );
        });
    });

    describe('partial path in JSON', () => {
        let stdoutString = undefined,
            unitTestFile;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/todomvc-ng2/src/tsconfig.json',
                '--unitTestCoverage',
                './test/src/todomvc-ng2/coverage-summary-alt.json',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).toContain('Unit test coverage');
            expect(unitTestFile).toContain('<span class="coverage-count">(22/26)</span>');
        });

        it('should have badges', () => {
            expect(unitTestFile).toContain('img src="./images/coverage-badge-statements.svg"');
            expect(unitTestFile).toContain('img src="./images/coverage-badge-branches.svg"');
            expect(unitTestFile).toContain('img src="./images/coverage-badge-functions.svg"');
            expect(unitTestFile).toContain('img src="./images/coverage-badge-lines.svg"');
        });

        it('should have partial file path links', () => {
            expect(unitTestFile).toContain(
                '<a href="./components/AppComponent.html">src/app/app.component.ts</a>'
            );
            expect(unitTestFile).toContain(
                '<a href="./components/AboutComponent.html">src/app/about/about.component.ts</a>'
            );
        });
    });
});
