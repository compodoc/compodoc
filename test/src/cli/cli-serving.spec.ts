import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI serving', () => {

    describe('when serving with -s flag in another directory', () => {

        let stdoutString = '',
            child;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-s',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env, timeout: 15000 });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(tmp.name));

        it('should serve', () => {
            expect(stdoutString).to.contain('Serving documentation from ../' + tmp.name + '/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory', () => {

        let stdoutString = '',
            child;
        before(function (done) {
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/sample-files/tsconfig.simple.json',
                '-s'], { env, timeout: 10000 });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });
    describe('when serving with default directory and without doc generation', () => {

        let stdoutString = '',
            child;
        before(function (done) {
            let ls = shell('node', [
                './bin/index-cli.js',
                '-s',
                '-d', './documentation/'], { env, timeout: 10000 });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory, without -d and without doc generation', () => {

        let stdoutString = '',
            child;
        before(function (done) {
            let ls = shell('node', [
                './bin/index-cli.js',
                '-s'], { env, timeout: 10000 });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean('documentation'));

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });
});
