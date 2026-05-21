import { expect } from 'chai';
import { temporaryDir, shell, read } from '../helpers';

const tmp = temporaryDir();

describe('CLI XSS - script tag injection in component template', () => {
    const distFolder = tmp.name + '-xss-script-tag';
    let componentFile: string;

    before(function (done) {
        this.timeout(60000);
        tmp.create(distFolder);

        const ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/sample-files/tsconfig.xss.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
        }
        componentFile = read(`${distFolder}/components/XssScriptTagComponent.html`);
        done();
    });

    after(() => tmp.clean(distFolder));

    it('should escape </script> sequences inside COMPONENT_TEMPLATE to prevent XSS', () => {
        // The raw </script> sequence must not appear inside the inline <script> block.
        // If it did, the browser HTML parser would close the script early and allow
        // arbitrary script injection. The fix escapes it as <\/script>.
        const scriptBlockMatch = componentFile.match(
            /var COMPONENT_TEMPLATE\s*=\s*'([\s\S]*?)'\s*\n/
        );
        expect(scriptBlockMatch, 'COMPONENT_TEMPLATE variable not found').to.not.be.null;
        const templateValue = scriptBlockMatch![1];
        expect(templateValue).to.not.contain('</script');
        expect(templateValue).to.contain('<\\/script');
    });
});
