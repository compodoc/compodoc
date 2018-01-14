import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();
const tsconfigPath = require.resolve('../../../tsconfig.json');
const env = Object.freeze({ TS_NODE_PROJECT: tsconfigPath, MODE: 'TESTING' });

describe('CLI simple generation - big app', () => {
    let stdoutString = undefined;
    let clockInterfaceFile;
    let searchFuncFile;

    let todoComponentFile, listComponentFile, footerComponentFile, routesIndex;

    before((done) => {
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p', './test/src/todomvc-ng2/src/tsconfig.json'], { env });

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        clockInterfaceFile = read(`documentation/interfaces/ClockInterface.html`);
        searchFuncFile = read(`documentation/interfaces/SearchFunc.html`);

        routesIndex = read(`documentation/js/routes/routes_index.js`);
        todoComponentFile = read(`documentation/components/TodoComponent.html`);
        footerComponentFile = read(`documentation/components/FooterComponent.html`);
        listComponentFile = read(`documentation/components/ListComponent.html`);
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

    /**
     * Dynamic imports for metadatas
     */
     it('should have metadatas - component', () => {
         expect(footerComponentFile).to.contain('footer.component.html');
     });
     it('should have metadatas - component with aliased import', () => {
         const file = read(`documentation/components/HeaderComponent.html`);
         expect(file).to.contain('header.component.html');
     });
     it('should have metadatas - directive', () => {
         const file = read(`documentation/directives/DoNothingDirective.html`);
         expect(file).to.contain('[donothing]');
     });

    /**
     * Routing
     */

    it('should not have a toggled item menu', () => {
        expect(routesIndex).to.not.contain('fa-angle-down');
    });

    it('should have a route index', () => {
        const isFileExists = exists(`documentation/js/routes/routes_index.js`);
        expect(isFileExists).to.be.true;
    });

    it('should have generated files', () => {
        expect(routesIndex).to.contain('AppModule');
        expect(routesIndex).to.contain('AppRoutingModule');
        expect(routesIndex).to.contain('HomeRoutingModule');
        expect(routesIndex).to.contain('AboutComponent');
    });

    it('should have a readme tab', () => {
        expect(todoComponentFile).to.contain('readme-tab');
        expect(listComponentFile).to.contain('readme-tab');
    });

    it('should have a decorator listed', () => {
        expect(footerComponentFile).to.contain('<i>Decorators : </i><code>LogProperty</code>');
    });

    /**
     * End Routing
     */

    it('should have generated search index json', () => {
        const isIndexExists = exists(`documentation/js/search/search_index.js`);
        expect(isIndexExists).to.be.true;
    });

    it('should have excluded big file for search index json', () => {
        const searchIndexFile = read(`documentation/js/search/search_index.js`);
        expect(searchIndexFile).to.not.contain('photo64_1');
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

        const pipeFile = read('documentation/pipes/FirstUpperPipe.html');
        expect(pipeFile).to.contain('<h3>Metadata');
        expect(pipeFile).to.contain('Example property');
        expect(pipeFile).to.contain('the transform function');
        expect(pipeFile).to.contain('<td class="col-md-9">true</td>');
        expect(pipeFile).to.contain('<td class="col-md-9">firstUpper</td>');
    });

    it('should have miscellaneous page', () => {
        const file = exists('documentation/miscellaneous/enumerations.html');
        expect(file).to.be.true;
    });

    it('miscellaneous page should contain some things', () => {
        const miscFile = read(`documentation/miscellaneous/enumerations.html`);
        expect(miscFile).to.contain('Directions of the app');
    });

    it('should have infos about SearchFunc interface', () => {
        expect(searchFuncFile).to.contain('A string');
    });

    it('should have infos about ClockInterface interface', () => {
        const file = read(`documentation/interfaces/ClockInterface.html`);
        expect(file).to.contain('A simple reset method');
    });

    it('should have generated args and return informations for todo store', () => {
        const file = read('documentation/injectables/TodoStore.html');
        expect(file).to.contain('Promise&lt;void&gt;');
        expect(file).to.contain('string | number');
        expect(file).to.contain('number[]');
        expect(file).to.contain('<code>stopMonitoring(theTodo?: <a href="../interfaces/LabelledTodo.html">LabelledTodo</a>)</code>');
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

    it('should have inherreturn type', () => {
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
        expect(file).to.contain('&quot;creating&quot; | &quot;created&quot; | &quot;updating&quot; | &quot;updated&quot');
    });

    it('should support return multiple with null & TypeLiteral', () => {
        let file = read('documentation/classes/Tidi.html');
        expect(file).to.contain('<code>literal type | null');
    });

    it('should support @HostBindings', () => {
        let file = read('documentation/directives/DoNothingDirective.html');
        expect(file).to.contain('<code>style.color');
    });

    it('should support @HostListener', () => {
        let file = read('documentation/components/AboutComponent.html');
        expect(file).to.contain('<code>mouseup(mouseX');
        expect(file).to.contain('i>Arguments : </i><code>\'$event.clientX');
    });

    it('should support extends for interface', () => {
        let file = read('documentation/interfaces/ClockInterface.html');
        expect(file).to.contain('Extends');
    });

    it('should support optional', () => {
        let file = read('documentation/injectables/TodoStore.html');
        expect(file).to.contain('yes');
    });

    it('should support optional', () => {
        let file = read('documentation/components/AboutComponent.html');
        expect(file).to.contain('<code>Subscription[]');
    });

    it('should support @link with anchor', () => {
        let file = read('documentation/injectables/TodoStore.html');
        expect(file).to.contain('../classes/Todo.html#completed');
    });

    it('should support self-defined type', () => {
        let file = read('documentation/classes/Todo.html');
        expect(file).to.contain('../miscellaneous/typealiases.html#PopupPosition');
        file = read('documentation/miscellaneous/typealiases.html');
        expect(file).to.contain('<code>ElementRef | HTMLElement</code>');
    });

    it('should support accessors for class', () => {
        let file = read('documentation/classes/Todo.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Setter of _title');
        expect(file).to.contain('<p>Returns the runtime path</p>');
    });

    it('should support accessors for injectables', () => {
        let file = read('documentation/injectables/TodoStore.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Getter of _fullName');
        expect(file).to.contain('Setter of _fullName');
    });

    it('should support accessors for directives', () => {
        let file = read('documentation/directives/DoNothingDirective.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Getter of _fullName');
        expect(file).to.contain('Setter of _fullName');
    });

    it('should support accessors for components with input', () => {
        let file = read('documentation/components/HeaderComponent.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Getter of _fullName');
        expect(file).to.contain('Setter of _fullName');

        expect(file).to.contain('Inputs');
    });

    it('should support QualifiedName for type', () => {
        let file = read('documentation/components/AboutComponent.html');
        expect(file).to.contain('Highcharts.Options');
    });

    it('should support namespace', () => {
        let file = read('documentation/modules/AboutModule2.html');
        expect(file).to.contain('The about module');

        file = read('documentation/components/AboutComponent2.html');
        expect(file).to.contain('The about component');

        file = read('documentation/directives/DoNothingDirective2.html');
        expect(file).to.contain('This directive does nothing !');

        file = read('documentation/classes/Todo2.html');
        expect(file).to.contain('The todo class');

        file = read('documentation/injectables/TodoStore2.html');
        expect(file).to.contain('This service is a todo store');

        file = read('documentation/interfaces/TimeInterface2.html');
        expect(file).to.contain('A time interface just for documentation purpose');

        file = read('documentation/pipes/FirstUpperPipe2.html');
        expect(file).to.contain('Uppercase the first letter of the string');

        file = read('documentation/miscellaneous/enumerations.html');
        expect(file).to.contain('PopupEffect2');

        file = read('documentation/miscellaneous/functions.html');
        expect(file).to.contain('foo2');

        file = read('documentation/miscellaneous/typealiases.html');
        expect(file).to.contain('Name2');

        file = read('documentation/miscellaneous/variables.html');
        expect(file).to.contain('PI2');
    });

    it('should support spread operator for modules metadatas', () => {
        let file = read('documentation/modules/HomeModule.html');
        expect(file).to.contain('../modules/FooterModule.html');
    });

    it('should support interceptors', () => {
        let file = read('documentation/modules/AppModule.html');
        expect(file).to.contain('../interceptors/NoopInterceptor.html');
        const fileTest = exists('documentation/interceptors/NoopInterceptor.html');
        expect(fileTest).to.be.true;
    });

    it('should have DOM tree tab for component with inline template', () => {
        let file = read('documentation/components/HomeComponent.html');
        expect(file).to.contain('<header class="header"');
    });

    it('should have parsed correctly private, public, and static methods or properties', () => {
        let file = read('documentation/components/AboutComponent.html');
        expect(file).to.contain('<code>privateStaticMethod()');
        expect(file).to.contain(`<span class="modifier">Static</span>\n                                    <span class="modifier">Private</span>`);
        expect(file).to.contain('<code>protectedStaticMethod()');
        expect(file).to.contain(`<span class="modifier">Static</span>\n                                    <span class="modifier">Protected</span>`);
        expect(file).to.contain('<code>publicMethod()');
        expect(file).to.contain('<code>publicStaticMethod()');
        expect(file).to.contain('<code>staticMethod()');
        expect(file).to.contain('staticReadonlyVariable');
        expect(file).to.contain(`<span class="modifier">Readonly</span>\n                                    <span class="modifier">Static</span>`);
    });

    it('should support entryComponents for modules', () => {
        let file = read('documentation/modules/AboutModule.html');
        expect(file).to.contain('<h3>EntryComponents');
        expect(file).to.contain('href="../components/AboutComponent.html"');
    });

    it('should id for modules', () => {
        let file = read('documentation/modules/AboutModule.html');
        expect(file).to.contain('<h3>Id');
    });

    it('should schemas for modules', () => {
        let file = read('documentation/modules/FooterModule.html');
        expect(file).to.contain('<h3>Schemas');
    });

    it('should support dynamic path for routes', () => {
        let routesFile = read('documentation/js/routes/routes_index.js');
        expect(routesFile).to.contain('homeimported');
        expect(routesFile).to.contain('homeenumimported');
        expect(routesFile).to.contain('homeenuminfile');
        expect(routesFile).to.contain('todomvcinstaticclass');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for modules', () => {
        let file = read('documentation/modules/AboutModule.html');
        expect(file).to.contain('<h3>Declarations');
        expect(file).to.contain('<h3>Imports');
        expect(file).to.contain('<h3>EntryComponents');
        expect(file).to.contain('<h3>Providers');
        expect(file).to.contain('<h3>Bootstrap');
        expect(file).to.contain('<h3>Schemas');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for components', () => {
        let file = read('documentation/components/HomeComponent.html');
        expect(file).to.contain('<h3>Metadata');
        expect(file).to.contain('<code>home</code>');
        expect(file).to.contain('<code>ChangeDetectionStrategy.OnPush</code>');
        expect(file).to.contain('<code>ViewEncapsulation.Emulated</code>');
        expect(file).to.contain('<code>./home.component.html</code>');
        expect(file).to.contain('<td class="col-md-3">template</td>');
    });

    it('should support @link to miscellaneous', () => {
        let file = read('documentation/components/AboutComponent.html');
        expect(file).to.contain('<a href="../miscellaneous/variables.html#PIT">PIT</a>');
        expect(file).to.contain('<a href="../miscellaneous/enumerations.html#Direction">Direction</a>');
        expect(file).to.contain('<a href="../miscellaneous/typealiases.html#ChartChange">ChartChange</a>');
        expect(file).to.contain('<a href="../miscellaneous/functions.html#foo">foo</a>');
    });
});
