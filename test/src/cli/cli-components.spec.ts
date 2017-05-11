import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI components', () => {

    let stdoutString = null, todoComponentFile, listComponentFile, footerComponentFile;
    before(function (done) {
        tmp.create();
        exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/todomvc-ng2/src/tsconfig.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                done('error');
                return;
            }
            stdoutString = stdout;
            todoComponentFile = read(`${tmp.name}/components/TodoComponent.html`);
            footerComponentFile = read(`${tmp.name}/components/FooterComponent.html`);
            listComponentFile = read(`${tmp.name}/components/ListComponent.html`);
            done();
        });
    });
    after(() => tmp.clean());

    it('it should have a readme tab', () => {
        expect(todoComponentFile).to.contain('readme-tab');
        expect(listComponentFile).to.contain('readme-tab');
    });

    it('it should have a decorator listed', () => {
        expect(footerComponentFile).to.contain('<i>Decorators : </i><code>LogProperty</code>');
    });

});
