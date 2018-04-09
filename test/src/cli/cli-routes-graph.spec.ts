import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir();

describe('CLI Routes graph', () => {

    const distFolder = tmp.name + '-routes-graph';

    describe('disable it', () => {

        let coverageFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/todomvc-ng2-simple-routing/src/tsconfig.json',
                '--disableRoutesGraph',
                '-d', distFolder]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should not exist routes_index.js file', () => {
            const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
            expect(isFileExists).to.be.false;
        });

    });

    describe('should support forRoot/forChild', () => {

        let coverageFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/src/todomvc-ng2-simple-routing/src/tsconfig.json',
                '-d', distFolder]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('should clean forRoot and forChild in modules imports', () => {
            let file = read(distFolder + '/modules/AppModule.html');
            expect(file).to.contain('<a href="../modules/HomeModule.html" >HomeModule</a>');
        });

    });
});
