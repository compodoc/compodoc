import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync, copy, remove, spawn} from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir(),
    tsconfigPath = require.resolve('../../../tsconfig.json'),
    env = Object.freeze({ TS_NODE_PROJECT: tsconfigPath, MODE: 'TESTING' });

describe('CLI watch', () => {

    let stdoutString = null,
        testCount = 0,
        testWatch = false,
        ls,
        fooCoverageFile;
    before(function(done) {
        tmp.create();
        var ls = spawn('node', [
            './bin/index-cli.js',
            '-p', './test/src/sample-files/tsconfig.simple.json',
            '-d', tmp.name + '/',
            '-s', '-w'], { env, timeout: 40000 });

         ls.stdout.on('data', function (data) {
             console.log('' + data);
             if (data.indexOf('Watching source') !== -1 && !testWatch) {
                fooCoverageFile = read(`${tmp.name}/coverage.html`);
                testWatch = true;
                done();
             }
         });

         ls.stderr.on('data', function (data) {
             //console.log('stderr: ' + data);
         });

         ls.on('close', function (code) {
             //done();
             //console.log('child process exited with code ' + code);
         });
    });
    after(() => {
        tmp.clean();
        copy('./test/src/bar.component.ts', './test/src/sample-files/bar.component.ts');
    });

    beforeEach(function(done) {
        console.log('testCount: ' + testCount);
        if (testCount === 1) {
            setTimeout(() => {
                copy('./test/src/bar.component-watch.ts', './test/src/sample-files/bar.component.ts');
            }, 1000);
        }
        done();
    });

    it('it should have coverage page', () => {
        testCount += 1;
        const isFileExists = exists(`${tmp.name}/coverage.html`);
        expect(isFileExists).to.be.true;
        expect(fooCoverageFile).to.contain('2/6');
    });

    it('it should have updated coverage page', (done) => {
        setTimeout(() => {
            fooCoverageFile = read(`${tmp.name}/coverage.html`);
            expect(fooCoverageFile).to.contain('3/6');
            done();
        }, 15000);
    });

});
