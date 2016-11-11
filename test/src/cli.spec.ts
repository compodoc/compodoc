import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists} from './helpers';
const tmp = temporaryDir();

describe('CLI', () => {

    describe('when no tsconfig.json provided', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('Entry file was not found');
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

    describe('when no tsconfig.json is found in cwd', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-p', '../test.json'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('"tsconfig.json" file was not found in the current directory');
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

});
