import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI Additional documentation', () => {

    let stdoutString = null,
        fooIndexFile,
        fooServiceFile;
    before(function (done) {
        tmp.create();
        exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/todomvc-ng2/src/tsconfig.json -d ' + tmp.name + '/ --includes ./test/src/todomvc-ng2/additional-doc --includesName "Additional documentation"', {env}, (error, stdout, stderr) => {
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

    it('it should have a menu with links', () => {
        expect(fooIndexFile).to.contain('<a href="./additional-documentation/introduction');
    });
    it('it should have generated files', () => {
        const isFileExists = exists(`${tmp.name}/additional-documentation/Edition.html`);
        expect(isFileExists).to.be.true;
    });
});
