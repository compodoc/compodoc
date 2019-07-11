import { read, shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI handlebars templates', () => {
    const distFolder = tmp.name + '-templates';

    describe('with alternative handlebar template files', () => {
        let indexFile, barComponentFile, fooComponentFile;
        beforeAll(function(done) {
            tmp.create(distFolder);

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--templates',
                './test/src/test-templates',
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
        afterAll(() => tmp.clean(distFolder));

        it('should use templated "page.hbs"', () => {
            expect(indexFile).toContain('<span>THIS IS TEST CONTENT</span>');
        });

        it('should use partial "component-detail.hbs"', () => {
            expect(barComponentFile).toEqual(
                expect.not.stringContaining('<td class="col-md-3">selector</td>')
            );
            expect(barComponentFile).toContain('<h3>Selector</h3>');
        });

        it('should use partial "block-constructor.hbs"', () => {
            expect(fooComponentFile).toContain('<code>myprop</code>');
            expect(fooComponentFile).toContain('<i><p>description</p>\n</i>');
        });
    });
});
