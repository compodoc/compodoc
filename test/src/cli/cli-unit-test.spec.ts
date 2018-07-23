import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir();

describe('CLI Unit Test Report', () => {

    const distFolder = tmp.name + '-unit-test';

    describe('unit-test page', () => {

        let stdoutString = undefined,
            unitTestFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/todomvc-ng2/src/tsconfig.json',
                '--unitTestCoverage', './test/src/todomvc-ng2/coverage-summary.json',
                '-d', distFolder]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            unitTestFile = read(`${distFolder}/unit-test.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should have unit test page', () => {
            expect(unitTestFile).to.contain('Unit test coverage');
            expect(unitTestFile).to.contain('img src="./images/coverage-badge-statements.svg"');
            expect(unitTestFile).to.contain('<span class="coverage-count">(22/26)</span>');
        });
      
      it('should have full file path', ()=>{
        
      }); 
    });

});