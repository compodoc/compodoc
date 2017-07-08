import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI routes', () => {

    let todoComponentFile, listComponentFile, footerComponentFile, routesIndex;
    before(function (done) {
        tmp.create();
        let ls = shell('node', [
            '../bin/index-cli.js',
            '-p', '../test/src/todomvc-ng2/src/tsconfig.json',
            '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env });

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        routesIndex = read(`${tmp.name}/js/routes/routes_index.js`);
        todoComponentFile = read(`${tmp.name}/components/TodoComponent.html`);
        footerComponentFile = read(`${tmp.name}/components/FooterComponent.html`);
        listComponentFile = read(`${tmp.name}/components/ListComponent.html`);
        done();
    });
    after(() => tmp.clean());

    it('it should not have a toggled item menu', () => {
        expect(routesIndex).to.not.contain('fa-angle-down');
    });

    it('it should have a route index', () => {
        const isFileExists = exists(`${tmp.name}/js/routes/routes_index.js`);
        expect(isFileExists).to.be.true;
    });
    it('it should have generated files', () => {
        expect(routesIndex).to.contain('AppModule');
        expect(routesIndex).to.contain('AppRoutingModule');
        expect(routesIndex).to.contain('HomeRoutingModule');
        expect(routesIndex).to.contain('AboutComponent');
    });

    it('it should have a readme tab', () => {
        expect(todoComponentFile).to.contain('readme-tab');
        expect(listComponentFile).to.contain('readme-tab');
    });

    it('it should have a decorator listed', () => {
        expect(footerComponentFile).to.contain('<i>Decorators : </i><code>LogProperty</code>');
    });
});
