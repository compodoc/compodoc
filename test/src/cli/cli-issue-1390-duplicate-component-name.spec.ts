import { expect } from 'chai';
import { temporaryDir, shell, read } from '../helpers';

const tmp = temporaryDir();

describe('CLI issue #1390 - duplicate component class names', () => {
    const distFolder = tmp.name + '-issue-1390';
    let documentationJson;

    before(done => {
        tmp.create(distFolder);

        const command = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/issue1390-duplicate-component-name/tsconfig.json',
            '--silent',
            '-e',
            'json',
            '-d',
            distFolder
        ]);

        if (command.stderr.toString() !== '') {
            console.error(`shell error: ${command.stderr.toString()}`);
            done('error');
            return;
        }

        documentationJson = JSON.parse(read(`${distFolder}/documentation.json`));
        done();
    });

    after(() => tmp.clean(distFolder));

    it('should keep both duplicate component classes in exported json', () => {
        const components = documentationJson.components.filter(
            comp => comp.name === 'ButtonComponent'
        );
        expect(components).to.have.length(2);
    });

    it('should not merge inputs between duplicate class names with different selectors', () => {
        const components = documentationJson.components.filter(
            comp => comp.name === 'ButtonComponent'
        );
        const currentComponent = components.find(
            comp => comp.selector === 'current-button'
        );
        const legacyComponent = components.find(
            comp => comp.selector === 'legacy-button'
        );

        expect(currentComponent).to.not.be.undefined;
        expect(legacyComponent).to.not.be.undefined;

        const currentInputs = currentComponent.inputsClass.map(input => input.name);
        const legacyInputs = legacyComponent.inputsClass.map(input => input.name);

        expect(currentInputs).to.include('label');
        expect(currentInputs).to.not.include('legacyLabel');
        expect(legacyInputs).to.include('legacyLabel');
        expect(legacyInputs).to.not.include('label');
    });
});
