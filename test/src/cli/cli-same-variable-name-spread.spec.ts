import { expect } from 'chai';
import { temporaryDir, shell, exists, read } from '../helpers';
const tmp = temporaryDir();

/**
 * Regression test for: two NgModules in different files share the same local variable name
 * (e.g. `const components = [...]`) spread into declarations/exports.
 *
 * Without the fix, the first module's variable would replace the placeholder in BOTH modules,
 * causing the second module to be missing its actual components.
 *
 * @see https://github.com/compodoc/compodoc/issues/XXXX
 */
describe('CLI same-variable-name spread in declarations/exports', () => {
    const distFolder = tmp.name + '-same-variable-name-spread';

    let moduleAFile: string;
    let moduleBFile: string;

    before(function (done) {
        tmp.create(distFolder);
        const ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/same-variable-name-spread/tsconfig.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
            return;
        }

        moduleAFile = read(`${distFolder}/modules/ModuleAModule.html`);
        moduleBFile = read(`${distFolder}/modules/ModuleBModule.html`);
        done();
    });

    after(() => tmp.clean(distFolder));

    it('should generate documentation successfully', () => {
        expect(exists(distFolder)).to.be.true;
    });

    it('should list AlphaComponent in ModuleAModule declarations', () => {
        expect(moduleAFile).to.contain('AlphaComponent');
    });

    it('should list BetaComponent in ModuleAModule declarations', () => {
        expect(moduleAFile).to.contain('BetaComponent');
    });

    it('should list GammaComponent in ModuleBModule declarations', () => {
        expect(moduleBFile).to.contain('GammaComponent');
    });

    it('should NOT list AlphaComponent or BetaComponent in ModuleBModule', () => {
        expect(moduleBFile).to.not.contain('AlphaComponent');
        expect(moduleBFile).to.not.contain('BetaComponent');
    });

    it('should NOT list GammaComponent in ModuleAModule', () => {
        expect(moduleAFile).to.not.contain('GammaComponent');
    });
});
