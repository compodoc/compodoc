import { expect } from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync, fs } from '../helpers';

const tmp = temporaryDir();

describe('CLI Unit Test Report', () => {
    const tmpFolder = tmp.name + '-unit-test';
    const distFolder = tmpFolder + '/documentation';

    describe('full path in JSON', () => {
        let stdoutString = undefined,
            unitTestFile;
        before(function (done) {
            tmp.create(tmpFolder);
            tmp.copy('./test/fixtures/todomvc-ng2/', tmpFolder);
            const ls = shell(
                'node',
                [
                    '../bin/index-cli.js',
                    '-p',
                    './src/tsconfig.json',
                    '--unitTestCoverage',
                    './coverage-summary.json',
                    '-d',
                    'documentation'
                ],
                { cwd: tmpFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });

        after(() => tmp.clean(tmpFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).to.contain('Unit test coverage');
            expect(unitTestFile).to.contain('<span class="coverage-count">(22/26)</span>');
        });

        it('should have badges', () => {
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-statements.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-branches.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-functions.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-lines.svg"');
        });

        it('should have full file path links', () => {
            expect(unitTestFile).to.contain(
                '<a href="./components/AppComponent.html">test/fixtures/todomvc-ng2/src/app/app.component.ts</a>'
            );
            expect(unitTestFile).to.contain(
                '<a href="./components/AboutComponent.html">test/fixtures/todomvc-ng2/src/app/about/about.component.ts</a>'
            );
        });
    });

    describe('partial path in JSON', () => {
        let stdoutString = undefined,
            unitTestFile;
        before(function (done) {
            tmp.create(tmpFolder);
            tmp.copy('./test/fixtures/todomvc-ng2/', tmpFolder);
            const ls = shell(
                'node',
                [
                    '../bin/index-cli.js',
                    '-p',
                    './src/tsconfig.json',
                    '--unitTestCoverage',
                    './coverage-summary-alt.json',
                    '-d',
                    'documentation'
                ],
                { cwd: tmpFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });
        after(() => tmp.clean(tmpFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).to.contain('Unit test coverage');
            expect(unitTestFile).to.contain('<span class="coverage-count">(22/26)</span>');
        });

        it('should have badges', () => {
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-statements.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-branches.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-functions.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-lines.svg"');
        });

        it('should have partial file path links', () => {
            expect(unitTestFile).to.contain(
                '<a href="./components/AppComponent.html">src/app/app.component.ts</a>'
            );
            expect(unitTestFile).to.contain(
                '<a href="./components/AboutComponent.html">src/app/about/about.component.ts</a>'
            );
        });
    });

    describe('Windows style path in JSON', () => {
        let stdoutString = undefined,
            unitTestFile;
        before(function (done) {
            tmp.create(tmpFolder);
            tmp.copy('./test/fixtures/todomvc-ng2/', tmpFolder);
            let ls = shell(
                'node',
                [
                    '../bin/index-cli.js',
                    '-p',
                    './src/tsconfig.json',
                    '--unitTestCoverage',
                    './coverage-summary-win.json',
                    '-d',
                    'documentation'
                ],
                { cwd: tmpFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });
        after(() => tmp.clean(tmpFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).to.contain('Unit test coverage');
            expect(unitTestFile).to.contain('<span class="coverage-count">(22/26)</span>');
        });

        it('should have badges', () => {
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-statements.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-branches.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-functions.svg"');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-lines.svg"');
        });

        it('should have partial file path links', () => {
            expect(unitTestFile).to.contain(
                '<a href="./components/AppComponent.html">src\\app\\app.component.ts</a>'
            );
            expect(unitTestFile).to.contain(
                '<a href="./components/AboutComponent.html">src\\app\\about\\about.component.ts</a>'
            );
        });
    });

    describe('Windows absolute path in JSON', () => {
        let stdoutString = undefined,
            unitTestFile;
        before(function (done) {
            tmp.create(tmpFolder);
            tmp.copy('./test/fixtures/todomvc-ng2/', tmpFolder);

            const winCoverageSummary = JSON.parse(
                read(`${tmpFolder}/coverage-summary-win.json`)
            );
            const absoluteWinCoverageSummary = {};
            const absolutePrefix = 'G:\\GitHubCleanup\\SoftwareEngineeringPortfolio\\Portfolio\\';

            Object.keys(winCoverageSummary).forEach(key => {
                if (key === 'total') {
                    absoluteWinCoverageSummary[key] = winCoverageSummary[key];
                } else {
                    absoluteWinCoverageSummary[`${absolutePrefix}${key}`] =
                        winCoverageSummary[key];
                }
            });

            fs.writeFileSync(
                `${tmpFolder}/coverage-summary-win-absolute.json`,
                JSON.stringify(absoluteWinCoverageSummary)
            );

            let ls = shell(
                'node',
                [
                    '../bin/index-cli.js',
                    '-p',
                    './src/tsconfig.json',
                    '--unitTestCoverage',
                    './coverage-summary-win-absolute.json',
                    '-d',
                    'documentation'
                ],
                { cwd: tmpFolder }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });
        after(() => tmp.clean(tmpFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).to.contain('Unit test coverage');
            expect(unitTestFile).to.contain('<span class="coverage-count">(22/26)</span>');
        });

        it('should resolve links for Windows absolute paths', () => {
            expect(unitTestFile).to.contain(
                '<a href="./components/AppComponent.html">G:\\GitHubCleanup\\SoftwareEngineeringPortfolio\\Portfolio\\src\\app\\app.component.ts</a>'
            );
            expect(unitTestFile).to.contain(
                '<a href="./components/AboutComponent.html">G:\\GitHubCleanup\\SoftwareEngineeringPortfolio\\Portfolio\\src\\app\\about\\about.component.ts</a>'
            );
        });
    });
});
