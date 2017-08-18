import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI simple generation - big app', () => {

      let stdoutString = null,
          clockInterfaceFile,
          searchFuncFile;
      before(function (done) {
          let ls = shell('node', [
              './bin/index-cli.js',
              '-p', './test/src/todomvc-ng2/src/tsconfig.json'], { env});

          if (ls.stderr.toString() !== '') {
              console.error(`shell error: ${ls.stderr.toString()}`);
              done('error');
          }
          stdoutString = ls.stdout.toString();
          clockInterfaceFile = read(`documentation/interfaces/ClockInterface.html`);
          searchFuncFile = read(`documentation/interfaces/SearchFunc.html`);
          done();
      });
      //after(() => tmp.clean('documentation'));

      it('should display generated message', () => {
          expect(stdoutString).to.contain('Documentation generated');
      });

      it('should have generated main folder', () => {
          const isFolderExists = exists('documentation');
          expect(isFolderExists).to.be.true;
      });

      it('should have generated main pages', () => {
          const isIndexExists = exists('documentation/index.html');
          expect(isIndexExists).to.be.true;
          const isModulesExists = exists('documentation/modules.html');
          expect(isModulesExists).to.be.true;
          const isOverviewExists = exists('documentation/overview.html');
          expect(isOverviewExists).to.be.true;
          const isRoutesExists = exists('documentation/routes.html');
          expect(isRoutesExists).to.be.true;
      });

      it('should have generated resources folder', () => {
          const isImagesExists = exists('documentation/images');
          expect(isImagesExists).to.be.true;
          const isJSExists = exists('documentation/js');
          expect(isJSExists).to.be.true;
          const isStylesExists = exists('documentation/styles');
          expect(isStylesExists).to.be.true;
          const isFontsExists = exists('documentation/fonts');
          expect(isFontsExists).to.be.true;
      });

      it('should have generated search index json', () => {
          const isIndexExists = exists(`documentation/js/search/search_index.js`);
          expect(isIndexExists).to.be.true;
      });

      it('should have generated extends information for todo class', () => {
          const todoModelFile = read(`documentation/classes/Todo.html`);
          expect(todoModelFile).to.contain('Extends');
      });

      it('should have generated implements information for clock class', () => {
          const classFile = read(`documentation/classes/Clock.html`);
          expect(classFile).to.contain('Implements');
      });

      it('should have generated interfaces', () => {
          const isInterfaceExists = exists('documentation/interfaces/ClockInterface.html');
          expect(isInterfaceExists).to.be.true;
      });

      it('should have generated classes', () => {
          const clockFile = exists('documentation/classes/Clock.html');
          expect(clockFile).to.be.true;
      });

      it('should have generated components', () => {
          const file = exists('documentation/components/AboutComponent.html');
          expect(file).to.be.true;
      });

      it('should have generated directives', () => {
          const file = exists('documentation/directives/DoNothingDirective.html');
          expect(file).to.be.true;
      });

      it('should have generated injectables', () => {
          const file = exists('documentation/injectables/TodoStore.html');
          expect(file).to.be.true;
      });

      it('should have generated modules', () => {
          const file = exists('documentation/modules/AboutModule.html');
          expect(file).to.be.true;
      });

      it('should have generated pipes', () => {
          const file = exists('documentation/pipes/FirstUpperPipe.html');
          expect(file).to.be.true;
      });

      it('should have miscellaneous page', () => {
          const file = exists('documentation/miscellaneous/enumerations.html');
          expect(file).to.be.true;
      });

      it('miscellaneous page should contain some things', () => {
          const miscFile = read(`documentation/miscellaneous/enumerations.html`);
          expect(miscFile).to.contain('Directions of the app');
      });

      it('it should have infos about SearchFunc interface', () => {
          expect(searchFuncFile).to.contain('A string');
      });

      it('it should have infos about ClockInterface interface', () => {
          const file = read(`documentation/interfaces/ClockInterface.html`);
          expect(file).to.contain('A simple reset method');
      });

      it('should have generated args and return informations for todo store', () => {
          const file = read('documentation/injectables/TodoStore.html');
          expect(file).to.contain('Promise&lt;void&gt;');
          expect(file).to.contain('string|number');
          expect(file).to.contain('number[]');
          expect(file).to.contain('<code>stopMonitoring(theTodo: <a href="../interfaces/LabelledTodo.html">LabelledTodo</a>)</code>');
          expect(file).to.contain('service is a todo store');
          expect(file).to.contain('all todos status (completed');
          expect(file).to.contain('Local array of Todos');
      });

      it('should have correct types for todo model', () => {
          const file = read('documentation/classes/Todo.html');
          expect(file).to.contain('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/boolean');
          expect(file).to.contain('testCommentFunction(dig: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number');
      });

      it('should have correct spread support', () => {
          const file = read('documentation/injectables/TodoStore.html');
          expect(file).to.contain('...theArgs');
      });

      it('should have an example tab', () => {
          const file = read('documentation/components/TodoComponent.html');
          expect(file).to.contain('data-link="example">Examples</a');
          expect(file).to.contain('iframe src=');
      });

      it('should have managed array declaration in modules', () => {
          const file = read('documentation/modules/TodoModule.html');
          expect(file).to.contain('<title>FirstUpperPipe</title>'); // Inside svg graph
          const file2 = read('documentation/modules/ListModule.html');
          expect(file2).to.contain('<title>TodoModule</title>'); // Inside svg graph
      });

      it('should have README tabs for each types', () => {
          let file = read('documentation/components/TodoComponent.html');
          expect(file).to.contain('id="readme-tab"');
          file = read('documentation/modules/AboutModule.html');
          expect(file).to.contain('id="readme-tab"');
          file = read('documentation/directives/DoNothingDirective.html');
          expect(file).to.contain('id="readme-tab"');
          file = read('documentation/injectables/TodoStore.html');
          expect(file).to.contain('id="readme-tab"');
          file = read('documentation/pipes/FirstUpperPipe.html');
          expect(file).to.contain('id="readme-tab"');
          file = read('documentation/classes/Todo.html');
          expect(file).to.contain('id="readme-tab"');
          file = read('documentation/interfaces/ClockInterface.html');
          expect(file).to.contain('id="readme-tab"');
      });

      it('should support indexable for class', () => {
          let file = read('documentation/classes/Todo.html');
          expect(file).to.contain('<code>[index: number]');
      });

      it('should have correct links for {@link into main description and constructor}', () => {
          let file = read('documentation/classes/Todo.html');
          expect(file).to.contain('See <a href="../injectables/TodoStore');
          expect(file).to.contain('Watch <a href="../injectables/TodoStore');
      });

      it('should support misc links', () => {
          let file = read('documentation/classes/Todo.html');
          expect(file).to.contain('../miscellaneous/enumerations.html');
      });

      it('should have public function for component', () => {
          let file = read('documentation/components/HomeComponent.html');
          expect(file).to.contain('code>showTab(');
      });

      it('should have override types for arguments of function', () => {
          const file = read('documentation/injectables/TodoStore.html');
          expect(file).to.contain('code><a href="../classes/Todo.html" target="_self" >To');
      });

      it('should have inherit return type', () => {
          const file = read('documentation/classes/Todo.html');
          expect(file).to.contain('code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number"');
      });

      it('should support simple class with custom decorator', () => {
          let file = read('documentation/classes/Tidi.html');
          expect(file).to.contain('<code>completed');
      });

      it('should support simple class with custom decorator()', () => {
          let file = read('documentation/classes/DoNothing.html');
          expect(file).to.contain('<code>aname');
      });

      it('should support TypeLiteral', () => {
          let file = read('documentation/miscellaneous/typealiases.html');
          expect(file).to.contain('&quot;creating&quot;|&quot;created&quot;|&quot;updating&quot;|&quot;updated&quot');
      });

});
