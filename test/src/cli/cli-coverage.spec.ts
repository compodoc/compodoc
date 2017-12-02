import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI coverage report', () => {

    describe('excluding coverage', () => {

        let stdoutString = undefined;
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

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageTest', '10',
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
            expect(stdoutString).to.contain('is over threshold');
        });

    });

    describe('coverage test command under', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageTest', '40',
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
            expect(stdoutString).to.contain('is not over threshold');
        });

    });

    describe('coverage test per file command under', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile', '1',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be under threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is not achieved');
        });

    });

    describe('coverage test per file command over', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile', '0',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is achieved');
        });

    });

    describe('coverage test per file command over and global threshold - 1/4', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile', '30',
                '--coverageTest', '70',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is not achieved');
        });
        it('it should not be over threshold', () => {
            expect(stdoutString).to.contain('is not over threshold');
        });

    });

    describe('coverage test per file command over and global threshold - 2/4', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile', '50',
                '--coverageTest', '10',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be not over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is not achieved');
        });
        it('it should be over threshold', () => {
            expect(stdoutString).to.contain('is over threshold');
        });

    });

    describe('coverage test per file command over and global threshold - 3/4', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile', '0',
                '--coverageTest', '10',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is achieved');
        });
        it('it should be over threshold', () => {
            expect(stdoutString).to.contain('is over threshold');
        });

    });

    describe('coverage test per file command over and global threshold - 4/4', () => {

        let stdoutString = undefined;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--coverageMinimumPerFile', '0',
                '--coverageTest', '25',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean());

        it('it should be over threshold per file', () => {
            expect(stdoutString).to.contain('Documentation coverage per file is achieved');
        });
        it('it should not be over threshold', () => {
            expect(stdoutString).to.contain('is not over threshold');
        });

    });

    describe('coverage page', () => {

        let stdoutString = undefined,
            coverageFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            coverageFile = read(`${tmp.name}/coverage.html`);
            done();
        });
        after(() => tmp.clean());

        it('it should have coverage page', () => {
            expect(coverageFile).to.contain('Documentation coverage');
            expect(coverageFile).to.contain('img src="./images/coverage-badge.svg"');
            expect(coverageFile).to.contain('5/5');
        });

    });

});
