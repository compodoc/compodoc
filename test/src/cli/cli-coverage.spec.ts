import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI coverage report', () => {

    describe('excluding coverage', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disableCoverage',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean());

        it('it should not have coverage page', () => {
            const isFileExists = exists(`${tmp.name}/coverage.html`);
            expect(isFileExists).to.be.false;
        });

    });

    describe('coverage test command above', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageTest', '15',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be over threshold', () => {
            expect(stdoutString).to.contain('Documentation coverage is over threshold');
        });

    });

    describe('coverage test command under', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageTest', '30',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should not be over threshold', () => {
            expect(stdoutString).to.contain('Documentation coverage is not over threshold');
        });

    });

});
