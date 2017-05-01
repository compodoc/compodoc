import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI exclude from tsconfig', () => {

    describe('when specific files are excluded in tsconfig', () => {
        let stdoutString = null;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.exclude.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                done();
            });
        });
        after(() => tmp.clean(tmp.name));

        it('should not create files excluded', () => {
            let isFileExists = exists(`${tmp.name}/components/BarComponent.js`);
            expect(isFileExists).to.be.false;
            isFileExists = exists(`${tmp.name}/modules/BarModule.js`);
            expect(isFileExists).to.be.false;
        });
    });

});
