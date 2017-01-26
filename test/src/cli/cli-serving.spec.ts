import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI serving', () => {

    describe('when serving with -s flag in another directory', () => {

        let stdoutString = '',
            child;
        before(function (done) {
            tmp.create();
            child = exec(tsNodePath + ' ./bin/index-cli.js -s -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 60000);
        });
        after(() => tmp.clean(tmp.name));

        it('should serve', () => {
            expect(stdoutString).to.contain('Serving documentation from ' + tmp.name + '/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory', () => {

        let stdoutString = null,
            child;
        before(function (done) {
            child = exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -s', {env}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 60000);
        });

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory and without doc generation', () => {

        let stdoutString = null,
            child;
        before(function (done) {
            child = exec(tsNodePath + ' ./bin/index-cli.js -s -d ./documentation/', {env}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 15000);
        });

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

    describe('when serving with default directory, without -d and without doc generation', () => {

        let stdoutString = null,
            child;
        before(function (done) {
            child = exec(tsNodePath + ' ./bin/index-cli.js -s', {env}, (error, stdout, stderr) => {});
            child.stdout.on('data', function(data) {
                stdoutString += data;
            });
            child.on('exit', (code, signal) => {
                done();
            });
            setTimeout(() => {
                child.kill();
            }, 15000);
        });
        after(() => tmp.clean('documentation'));

        it('should display message', () => {
            expect(stdoutString).to.contain('Serving documentation from ./documentation/ at http://127.0.0.1:8080');
        });
    });

});
