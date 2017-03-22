import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI toggle menu items', () => {

    describe('without', () => {
        let stdoutString = null,
            fooIndexFile,
            fooServiceFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/todomvc-ng2/src/tsconfig.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                fooIndexFile = read(`${tmp.name}/index.html`);
                done();
            });
        });
        after(() => tmp.clean());

        it('it should not have a toggled item menu', () => {
            expect(fooIndexFile).to.not.contain('fa-angle-down');
        });
    });

    describe('with a list', () => {
        let stdoutString = null,
            fooIndexFile,
            fooServiceFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + " ./bin/index-cli.js -p ./test/src/todomvc-ng2/src/tsconfig.json -d " + tmp.name + "/ --toggleMenuItems 'modules'", {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                fooIndexFile = read(`${tmp.name}/index.html`);
                done();
            });
        });
        after(() => tmp.clean());

        it('it should have a toggled item menu', () => {
            expect(fooIndexFile).to.contain('fa-angle-down');
        });
    });
});
