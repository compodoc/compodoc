import { expect } from 'chai';
import { temporaryDir, shell, exists, read } from '../helpers';

const tmp = temporaryDir();

describe('CLI issue #623 - barrel spread declarations', () => {
    const distFolder = tmp.name + '-issue-623-barrel-spread';
    let documentation: any;

    before(function (done) {
        tmp.create(distFolder);
        const ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/issue623-barrel-spread/tsconfig.json',
            '-e',
            'json',
            '-d',
            distFolder,
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
            return;
        }

        documentation = JSON.parse(read(`${distFolder}/documentation.json`));
        done();
    });

    after(() => tmp.clean(distFolder));

    it('should generate documentation successfully', () => {
        expect(exists(distFolder)).to.be.true;
    });

    it('should resolve declarations from namespace barrel spread', () => {
        const appModule = documentation.modules.find(
            (module) => module.name === 'AppModule',
        );
        const declarations = appModule.children.find(
            (child) => child.type === 'declarations',
        ).elements;

        const declarationNames = declarations.map((entry) => entry.name);

        expect(declarationNames).to.include('RegistrationRootComponent');
        expect(declarationNames).to.include('AccountTypeComponent');
    });

    it('should resolve exports from namespace barrel spread', () => {
        const appModule = documentation.modules.find(
            (module) => module.name === 'AppModule',
        );
        const exportsElements = appModule.children.find(
            (child) => child.type === 'exports',
        ).elements;

        const exportNames = exportsElements.map((entry) => entry.name);

        expect(exportNames).to.include('RegistrationRootComponent');
        expect(exportNames).to.include('AccountTypeComponent');
    });
});
