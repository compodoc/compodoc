import { expect } from 'chai';
import { temporaryDir, shell, exists, read } from '../helpers';
import * as fs from 'fs';
import * as path from 'path';

const tmp = temporaryDir();

describe('CLI Markdown files generation', () => {
    const distFolder = path.resolve(tmp.name + '-markdown-files');
    const fixtureFolder = path.resolve(tmp.name + '-markdown-fixture');
    const cliPath = path.resolve('./bin/index-cli.js');
    
    describe('when CHANGELOG, CONTRIBUTING, and LICENSE markdown files exist', () => {
        let stdoutString = undefined;
        let menuFile;

        before(function (done) {
            // Create fixture folder with markdown files
            tmp.create(fixtureFolder);
            tmp.create(distFolder);
            
            // Copy sample files for basic Angular app
            const srcFolder = path.join(fixtureFolder, 'src');
            fs.mkdirSync(srcFolder, { recursive: true });
            
            // Copy source file
            fs.copyFileSync(
                './test/fixtures/sample-files/app.module.ts',
                path.join(srcFolder, 'app.module.ts')
            );
            
            // Create a proper tsconfig.json
            const tsconfigContent = {
                "compilerOptions": {
                    "target": "es5",
                    "module": "commonjs",
                    "moduleResolution": "node",
                    "emitDecoratorMetadata": true,
                    "experimentalDecorators": true,
                    "sourceMap": true,
                    "lib": ["es2015", "dom"]
                },
                "include": [
                    "src/**/*.ts"
                ],
                "exclude": [
                    "node_modules"
                ]
            };
            fs.writeFileSync(
                path.join(fixtureFolder, 'tsconfig.json'),
                JSON.stringify(tsconfigContent, null, 2)
            );

            fs.writeFileSync(
                path.join(fixtureFolder, 'CHANGELOG.md'),
                '# Changelog\n\n- fix: bitbucket link ([abc1234](https://bitbucket.org/team/repo/commit/abc1234))\n'
            );
            fs.writeFileSync(
                path.join(fixtureFolder, 'CONTRIBUTING.md'),
                '# Contributing\n\nPlease contribute.\n'
            );
            fs.writeFileSync(
                path.join(fixtureFolder, 'LICENSE.md'),
                '# License\n\nMIT\n'
            );
            
            const ls = shell('node', [
                cliPath,
                '-p',
                'tsconfig.json',
                '-d',
                distFolder
            ], { cwd: fixtureFolder });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            menuFile = read(`${distFolder}/js/menu-wc.js`);
            done();
        });
        
        after(() => {
            tmp.clean(distFolder);
            tmp.clean(fixtureFolder);
        });

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should find and process CHANGELOG.md file', () => {
            expect(stdoutString).to.contain('CHANGELOG.md file found');
        });

        it('should find and process CONTRIBUTING.md file', () => {
            expect(stdoutString).to.contain('CONTRIBUTING.md file found');
        });

        it('should find and process LICENSE.md file', () => {
            expect(stdoutString).to.contain('LICENSE.md file found');
        });

        it('should generate changelog.html page', () => {
            const changelogExists = exists(`${distFolder}/changelog.html`);
            expect(changelogExists).to.be.true;
            const changelogContent = read(`${distFolder}/changelog.html`);
            expect(changelogContent).to.contain('changelog');
        });

        it('should normalize bitbucket commit links in changelog to /commits/', () => {
            const changelogContent = read(`${distFolder}/changelog.html`);
            expect(changelogContent).to.contain(
                'https://bitbucket.org/team/repo/commits/abc1234'
            );
            expect(changelogContent).to.not.contain(
                'https://bitbucket.org/team/repo/commit/abc1234'
            );
        });

        it('should generate contributing.html page', () => {
            const contributingExists = exists(`${distFolder}/contributing.html`);
            expect(contributingExists).to.be.true;
            const contributingContent = read(`${distFolder}/contributing.html`);
            expect(contributingContent).to.contain('Contributing');
        });

        it('should generate license.html page', () => {
            const licenseExists = exists(`${distFolder}/license.html`);
            expect(licenseExists).to.be.true;
            const licenseContent = read(`${distFolder}/license.html`);
            expect(licenseContent).to.contain('License');
        });

        it('should include CHANGELOG link in menu', () => {
            expect(menuFile).to.contain('changelog.html');
            expect(menuFile).to.contain('CHANGELOG');
        });

        it('should include CONTRIBUTING link in menu', () => {
            expect(menuFile).to.contain('contributing.html');
            expect(menuFile).to.contain('CONTRIBUTING');
        });

        it('should include LICENSE link in menu', () => {
            expect(menuFile).to.contain('license.html');
            expect(menuFile).to.contain('LICENSE');
        });
    });

    describe('regression test for markdown menu entries', () => {
        let menuFile;

        before(function (done) {
            tmp.create(distFolder + '-regression');
            
            // Run compodoc - it will find project's markdown files from root
            const ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '-d',
                distFolder + '-regression'
            ]);

            if (ls.stderr.toString() !== '' ) {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            menuFile = read(`${distFolder}-regression/js/menu-wc.js`);
            done();
        });
        
        after(() => tmp.clean(distFolder + '-regression'));

        it('should populate markdowns array when markdown files are found', () => {
            // REGRESSION TEST: This verifies that Configuration.mainData.markdowns.push()
            // is properly called for each markdown file (lines 367-372 in application.ts)
            // The bug was that this code was removed, causing markdown files to not
            // appear in the navigation menu. This test ensures they are present.
            expect(menuFile).to.contain('changelog.html');
            expect(menuFile).to.contain('contributing.html');
            expect(menuFile).to.contain('license.html');
        });
    });
});
