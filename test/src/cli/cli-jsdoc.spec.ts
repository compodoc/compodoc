import * as chai from 'chai';
const expect = chai.expect;

import {temporaryDir, shell, pkg, exists, exec, read} from '../helpers';
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const tsNodePath = require.resolve('../../../node_modules/.bin/ts-node');
const env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI jsdoc tags', () => {

    describe('@link @param & @returns', () => {

        let stdoutString = null,
            fooComponentFile,
            fooServiceFile;
        before(function (done) {
            tmp.create();
            exec(tsNodePath + ' ./bin/index-cli.js -p ./test/src/sample-files/tsconfig.simple.json -d ' + tmp.name + '/', {env}, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done('error');
                    return;
                }
                stdoutString = stdout;
                fooComponentFile = read(`${tmp.name}/components/FooComponent.html`);
                fooServiceFile = read(`${tmp.name}/injectables/FooService.html`);
                done();
            });
        });
        after(() => tmp.clean());

        it('it should have a link with this syntax {@link BarComponent}', () => {
            expect(fooComponentFile).to.contain('<a href="../components/BarComponent.html">BarComponent');
        });

        it('it should have a link with this syntax [BarComponent2]{@link BarComponent}', () => {
            expect(fooComponentFile).to.contain('<a href="../components/BarComponent.html">BarComponent2');
        });

        it('it should have a link with this syntax {@link BarComponent|BarComponent3}', () => {
            expect(fooComponentFile).to.contain('<a href="../components/BarComponent.html">BarComponent3');
        });


        it('it should have infos about FooService open function param', () => {
            expect(fooServiceFile).to.contain('<b>val</b>');
            expect(fooServiceFile).to.contain('<p>The entry value</p>');
        });

        it('it should have infos about FooService open function returns', () => {
            expect(fooServiceFile).to.contain('<p>The string</p>');
        });

        it('it should have infos about FooService open function example', () => {
            expect(fooServiceFile).to.contain('<b>Example :</b>');
            expect(fooServiceFile).to.contain('FooService.open(');
        });
    });

});
