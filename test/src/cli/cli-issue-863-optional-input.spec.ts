import { expect } from 'chai';
import { temporaryDir, shell, read } from '../helpers';

const tmp = temporaryDir();

describe('CLI issue #863 - optional flag on decorator inputs', () => {
    const distFolder = tmp.name + '-issue-863';
    let component;

    const inputNamed = name => component.inputsClass.find(input => input.name === name);

    before(done => {
        tmp.create(distFolder);

        const command = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/issue863-optional-input/tsconfig.json',
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

        const documentationJson = JSON.parse(read(`${distFolder}/documentation.json`));
        component = documentationJson.components.find(
            comp => comp.name === 'OptionalInputComponent'
        );
        done();
    });

    after(() => tmp.clean(distFolder));

    it('should mark an optional decorator input as optional', () => {
        expect(inputNamed('optionalInput').optional).to.be.true;
    });

    it('should not mark a non-optional decorator input as optional', () => {
        expect(inputNamed('mandatoryInput').optional).to.be.false;
    });

    it('should let an explicit required config win over the question token', () => {
        expect(inputNamed('explicitlyRequiredInput').optional).to.be.false;
    });

    it('should report a decorator input the same way as an equivalent plain property', () => {
        const plainProperty = component.propertiesClass.find(
            property => property.name === 'optionalProperty'
        );

        expect(inputNamed('optionalInput').optional).to.equal(plainProperty.optional);
    });
});
