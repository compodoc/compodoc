import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI handlebars templates', () => {
    const distFolder = tmp.name + '-templates';

    describe('with alternative handlebar template files', () => {
        let indexFile, barComponentFile, fooComponentFile;
        before(function(done) {
            tmp.create(distFolder);

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/fixtures/sample-files/tsconfig.simple.json',
                '--templates',
                './test/fixtures/test-templates',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            indexFile = read(`${distFolder}/index.html`);
            barComponentFile = read(`${distFolder}/components/BarComponent.html`);
            fooComponentFile = read(`${distFolder}/components/FooComponent.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should use templated "page.hbs"', () => {
            expect(indexFile).to.contain('<span>THIS IS TEST CONTENT</span>');
            expect(indexFile).to.contain('<div class="content overview bg-info">');
        });

        it('should use partial "component-detail.hbs"', () => {
            expect(barComponentFile).not.to.contain('<td class="col-md-3">selector</td>');
            expect(barComponentFile).to.contain('<h3>Selector</h3>');
        });

        it('should use partial "block-constructor.hbs"', () => {
            expect(fooComponentFile).to.contain('<code>myprop</code>');
            expect(fooComponentFile).to.contain('<i><p>description</p>\n</i>');
        });
    });
});
