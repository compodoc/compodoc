import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI coverage report', () => {

    describe('test coverage', () => {

        let stdoutString = null, coverageFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                coverageFile = read(`${tmp.name}/coverage.html`);
                done();
            });
        });
        after(() => tmp.clean());

        it('it should have coverage page', () => {
            expect(coverageFile).to.contain('Documentation coverage');
            expect(coverageFile).to.contain('<span class="count');
        });

    });

    describe('excluding coverage', () => {

        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json --disableCoverage -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                done();
            });
        });
        after(() => tmp.clean());

        it('it should not have coverage page', () => {
            const isFileExists = exists(`${tmp.name}/coverage.html`);
            expect(isFileExists).to.be.false;
        });

    });

});
