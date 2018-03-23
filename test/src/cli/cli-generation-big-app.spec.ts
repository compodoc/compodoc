import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI simple generation - big app', () => {
    let stdoutString = undefined;
    let clockInterfaceFile;
    let searchFuncFile;

    let todoComponentFile, listComponentFile, footerComponentFile, routesIndex;

    const distFolder = tmp.name + '-big-app';

    before(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/todomvc-ng2/src/tsconfig.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        clockInterfaceFile = read(`${distFolder}/interfaces/ClockInterface.html`);
        searchFuncFile = read(`${distFolder}/interfaces/SearchFunc.html`);

        routesIndex = read(`${distFolder}/js/routes/routes_index.js`);
        todoComponentFile = read(`${distFolder}/components/TodoComponent.html`);
        footerComponentFile = read(`${distFolder}/components/FooterComponent.html`);
        listComponentFile = read(`${distFolder}/components/ListComponent.html`);
        done();
    });
    after(() => tmp.clean(distFolder));

    it('should display generated message', () => {
        expect(stdoutString).to.contain('Documentation generated');
    });

    it('should have generated main folder', () => {
        const isFolderExists = exists(distFolder);
        expect(isFolderExists).to.be.true;
    });

    it('should have generated main pages', () => {
        const isIndexExists = exists(distFolder + '/index.html');
        expect(isIndexExists).to.be.true;
        const isModulesExists = exists(distFolder + '/modules.html');
        expect(isModulesExists).to.be.true;
        const isOverviewExists = exists(distFolder + '/overview.html');
        expect(isOverviewExists).to.be.true;
        const isRoutesExists = exists(distFolder + '/routes.html');
        expect(isRoutesExists).to.be.true;
    });

    it('should have generated resources folder', () => {
        const isImagesExists = exists(distFolder + '/images');
        expect(isImagesExists).to.be.true;
        const isJSExists = exists(distFolder + '/js');
        expect(isJSExists).to.be.true;
        const isStylesExists = exists(distFolder + '/styles');
        expect(isStylesExists).to.be.true;
        const isFontsExists = exists(distFolder + '/fonts');
        expect(isFontsExists).to.be.true;
    });

    /**
     * Dynamic imports for metadatas
     */
    it('should have metadatas - component', () => {
        expect(footerComponentFile).to.contain('footer.component.html');
    });
    it('should have metadatas - component with aliased import', () => {
        const file = read(`${distFolder}/components/HeaderComponent.html`);
        expect(file).to.contain('header.component.html');
    });
    it('should have metadatas - directive', () => {
        const file = read(`${distFolder}/directives/DoNothingDirective.html`);
        expect(file).to.contain('[donothing]');
    });

    /**
     * Routing
     */

    it('should not have a toggled item menu', () => {
        expect(routesIndex).to.not.contain('fa-angle-down');
    });

    it('should have a route index', () => {
        const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
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
        const isIndexExists = exists(`${distFolder}/js/search/search_index.js`);
        expect(isIndexExists).to.be.true;
    });

    it('should have excluded big file for search index json', () => {
        const searchIndexFile = read(`${distFolder}/js/search/search_index.js`);
        expect(searchIndexFile).to.not.contain('photo64_1');
    });

    it('should have generated extends information for todo class', () => {
        const todoModelFile = read(`${distFolder}/classes/Todo.html`);
        expect(todoModelFile).to.contain('Extends');
    });

    it('should have generated implements information for clock class', () => {
        const classFile = read(`${distFolder}/classes/Clock.html`);
        expect(classFile).to.contain('Implements');
    });

    it('should have generated interfaces', () => {
        const isInterfaceExists = exists(distFolder + '/interfaces/ClockInterface.html');
        expect(isInterfaceExists).to.be.true;
    });

    it('should have generated classes', () => {
        const clockFile = exists(distFolder + '/classes/Clock.html');
        expect(clockFile).to.be.true;
    });

    it('should have generated components', () => {
        const file = exists(distFolder + '/components/AboutComponent.html');
        expect(file).to.be.true;
    });

    it('should have generated directives', () => {
        const file = exists(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.be.true;
    });

    it('should have generated injectables', () => {
        const file = exists(distFolder + '/injectables/TodoStore.html');
        expect(file).to.be.true;
    });

    it('should have generated modules', () => {
        const file = exists(distFolder + '/modules/AboutModule.html');
        expect(file).to.be.true;
    });

    it('should have generated pipes', () => {
        const file = exists(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).to.be.true;

        const pipeFile = read(distFolder + '/pipes/FirstUpperPipe.html');
        expect(pipeFile).to.contain('<h3>Metadata');
        expect(pipeFile).to.contain('Example property');
        expect(pipeFile).to.contain('the transform function');
        expect(pipeFile).to.contain('<td class="col-md-9">true</td>');
        expect(pipeFile).to.contain('<td class="col-md-9">firstUpper</td>');
    });

    it('should have miscellaneous page', () => {
        const file = exists(distFolder + '/miscellaneous/enumerations.html');
        expect(file).to.be.true;
    });

    it('miscellaneous page should contain some things', () => {
        const miscFile = read(`${distFolder}/miscellaneous/enumerations.html`);
        expect(miscFile).to.contain('Directions of the app');
    });

    it('should have infos about SearchFunc interface', () => {
        expect(searchFuncFile).to.contain('A string');
    });

    it('should have infos about ClockInterface interface', () => {
        const file = read(`${distFolder}/interfaces/ClockInterface.html`);
        expect(file).to.contain('A simple reset method');
    });

    it('should have generated args and return informations for todo store', () => {
        const file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('Promise&lt;void&gt;');
        expect(file).to.contain('string | number');
        expect(file).to.contain('number[]');
        expect(file).to.contain(
            '<code>stopMonitoring(theTodo?: <a href="../interfaces/LabelledTodo.html">LabelledTodo</a>)</code>'
        );
        expect(file).to.contain('service is a todo store');
        expect(file).to.contain('all todos status (completed');
        expect(file).to.contain('Local array of Todos');
    });

    it('should have correct types for todo model', () => {
        const file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/boolean'
        );
        expect(file).to.contain(
            'testCommentFunction(dig: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number'
        );
    });

    it('should have correct spread support', () => {
        const file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('...theArgs');
    });

    it('should have an example tab', () => {
        const file = read(distFolder + '/components/TodoComponent.html');
        expect(file).to.contain('data-link="example">Examples</a');
        expect(file).to.contain('iframe src=');
    });

    it('should have managed array declaration in modules', () => {
        const file = read(distFolder + '/modules/TodoModule.html');
        expect(file).to.contain('<title>FirstUpperPipe</title>'); // Inside svg graph
        const file2 = read(distFolder + '/modules/ListModule.html');
        expect(file2).to.contain('<title>TodoModule</title>'); // Inside svg graph
    });

    it('should have README tabs for each types', () => {
        let file = read(distFolder + '/components/TodoComponent.html');
        expect(file).to.contain('id="readme-tab"');
        file = read(distFolder + '/modules/AboutModule.html');
        expect(file).to.contain('id="readme-tab"');
        file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.contain('id="readme-tab"');
        file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('id="readme-tab"');
        file = read(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).to.contain('id="readme-tab"');
        file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('id="readme-tab"');
        file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).to.contain('id="readme-tab"');
    });

    it('should support indexable for class', () => {
        let file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('<code>[index: number]');
    });

    it('should have correct links for {@link into main description and constructor}', () => {
        let file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('See <a href="../injectables/TodoStore');
        expect(file).to.contain('Watch <a href="../injectables/TodoStore');
    });

    it('should support misc links', () => {
        let file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('../miscellaneous/enumerations.html');
    });

    it('should have public function for component', () => {
        let file = read(distFolder + '/components/HomeComponent.html');
        expect(file).to.contain('code>showTab(');
    });

    it('should have override types for arguments of function', () => {
        const file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('code><a href="../classes/Todo.html" target="_self" >To');
    });

    it('should have inherreturn type', () => {
        const file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain(
            'code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number"'
        );
    });

    it('should support simple class with custom decorator', () => {
        let file = read(distFolder + '/classes/Tidi.html');
        expect(file).to.contain('<code>completed');
    });

    it('should support simple class with custom decorator()', () => {
        let file = read(distFolder + '/classes/DoNothing.html');
        expect(file).to.contain('<code>aname');
    });

    it('should support TypeLiteral', () => {
        let file = read(distFolder + '/miscellaneous/typealiases.html');
        expect(file).to.contain(
            '&quot;creating&quot; | &quot;created&quot; | &quot;updating&quot; | &quot;updated&quot'
        );
    });

    it('should support return multiple with null & TypeLiteral', () => {
        let file = read(distFolder + '/classes/Tidi.html');
        expect(file).to.contain('<code>literal type | null');
    });

    it('should support @HostBindings', () => {
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.contain('<code>style.color');
    });

    it('should support @HostListener', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain('<code>mouseup(mouseX');
        expect(file).to.contain("i>Arguments : </i><code>'$event.clientX");
    });

    it('should support extends for interface', () => {
        let file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).to.contain('Extends');
    });

    it('should support optional', () => {
        let file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('yes');
    });

    it('should support optional', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain('<code>Subscription[]');
    });

    it('should support @link with anchor', () => {
        let file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('../classes/Todo.html#completed');
    });

    it('should support self-defined type', () => {
        let file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('../miscellaneous/typealiases.html#PopupPosition');
        file = read(distFolder + '/miscellaneous/typealiases.html');
        expect(file).to.contain('<code>ElementRef | HTMLElement</code>');
    });

    it('should support accessors for class', () => {
        let file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Setter of _title');
        expect(file).to.contain('<p>Returns the runtime path</p>');
        expect(file).to.contain('<code>title(value');
    });

    it('should support accessors for injectables', () => {
        let file = read(distFolder + '/injectables/TodoStore.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Getter of _fullName');
        expect(file).to.contain('Setter of _fullName');
    });

    it('should support accessors for directives', () => {
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Getter of _fullName');
        expect(file).to.contain('Setter of _fullName');
    });

    it('should support accessors for components with input', () => {
        let file = read(distFolder + '/components/HeaderComponent.html');
        expect(file).to.contain('Accessors');
        expect(file).to.contain('Getter of _fullName');
        expect(file).to.contain('Setter of _fullName');

        expect(file).to.contain('Inputs');
    });

    it('should support QualifiedName for type', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain('Highcharts.Options');
    });

    it('should support namespace', () => {
        let file = read(distFolder + '/modules/AboutModule2.html');
        expect(file).to.contain('The about module');

        file = read(distFolder + '/components/AboutComponent2.html');
        expect(file).to.contain('The about component');

        file = read(distFolder + '/directives/DoNothingDirective2.html');
        expect(file).to.contain('This directive does nothing !');

        file = read(distFolder + '/classes/Todo2.html');
        expect(file).to.contain('The todo class');

        file = read(distFolder + '/injectables/TodoStore2.html');
        expect(file).to.contain('This service is a todo store');

        file = read(distFolder + '/interfaces/TimeInterface2.html');
        expect(file).to.contain('A time interface just for documentation purpose');

        file = read(distFolder + '/pipes/FirstUpperPipe2.html');
        expect(file).to.contain('Uppercase the first letter of the string');

        file = read(distFolder + '/miscellaneous/enumerations.html');
        expect(file).to.contain('PopupEffect2');

        file = read(distFolder + '/miscellaneous/functions.html');
        expect(file).to.contain('foo2');

        file = read(distFolder + '/miscellaneous/typealiases.html');
        expect(file).to.contain('Name2');

        file = read(distFolder + '/miscellaneous/variables.html');
        expect(file).to.contain('PI2');
    });

    it('should support spread operator for modules metadatas', () => {
        let file = read(distFolder + '/modules/HomeModule.html');
        expect(file).to.contain('../modules/FooterModule.html');
    });

    it('should support interceptors', () => {
        let file = read(distFolder + '/modules/AppModule.html');
        expect(file).to.contain('../interceptors/NoopInterceptor.html');
        const fileTest = exists(distFolder + '/interceptors/NoopInterceptor.html');
        expect(fileTest).to.be.true;
    });

    it('should have DOM tree tab for component with inline template', () => {
        let file = read(distFolder + '/components/HomeComponent.html');
        expect(file).to.contain('<header class="header"');
    });

    it('should have parsed correctly private, public, and static methods or properties', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain('<code>privateStaticMethod()');
        expect(file).to.contain(
            `<span class="modifier">Static</span>\n                                    <span class="modifier">Private</span>`
        );
        expect(file).to.contain('<code>protectedStaticMethod()');
        expect(file).to.contain(
            `<span class="modifier">Static</span>\n                                    <span class="modifier">Protected</span>`
        );
        expect(file).to.contain('<code>publicMethod()');
        expect(file).to.contain('<code>publicStaticMethod()');
        expect(file).to.contain('<code>staticMethod()');
        expect(file).to.contain('staticReadonlyVariable');
        expect(file).to.contain(
            `<span class="modifier">Readonly</span>\n                                    <span class="modifier">Static</span>`
        );
    });

    it('should support entryComponents for modules', () => {
        let file = read(distFolder + '/modules/AboutModule.html');
        expect(file).to.contain('<h3>EntryComponents');
        expect(file).to.contain('href="../components/AboutComponent.html"');
    });

    it('should id for modules', () => {
        let file = read(distFolder + '/modules/AboutModule.html');
        expect(file).to.contain('<h3>Id');
    });

    it('should schemas for modules', () => {
        let file = read(distFolder + '/modules/FooterModule.html');
        expect(file).to.contain('<h3>Schemas');
    });

    it('should support dynamic path for routes', () => {
        let routesFile = read(distFolder + '/js/routes/routes_index.js');
        expect(routesFile).to.contain('homeimported');
        expect(routesFile).to.contain('homeenumimported');
        expect(routesFile).to.contain('homeenuminfile');
        expect(routesFile).to.contain('todomvcinstaticclass');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for modules', () => {
        let file = read(distFolder + '/modules/AboutModule.html');
        expect(file).to.contain('<h3>Declarations');
        expect(file).to.contain('<h3>Imports');
        expect(file).to.contain('<h3>EntryComponents');
        expect(file).to.contain('<h3>Providers');
        expect(file).to.contain('<h3>Bootstrap');
        expect(file).to.contain('<h3>Schemas');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for components', () => {
        let file = read(distFolder + '/components/HomeComponent.html');
        expect(file).to.contain('<h3>Metadata');
        expect(file).to.contain('<code>home</code>');
        expect(file).to.contain('<code>ChangeDetectionStrategy.OnPush</code>');
        expect(file).to.contain('<code>ViewEncapsulation.Emulated</code>');
        expect(file).to.contain('<code>./home.component.html</code>');
        expect(file).to.contain('<td class="col-md-3">template</td>');
    });

    it('should support @link to miscellaneous', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain('<a href="../miscellaneous/variables.html#PIT">PIT</a>');
        expect(file).to.contain(
            '<a href="../miscellaneous/enumerations.html#Direction">Direction</a>'
        );
        expect(file).to.contain(
            '<a href="../miscellaneous/typealiases.html#ChartChange">ChartChange</a>'
        );
        expect(file).to.contain('<a href="../miscellaneous/functions.html#foo">foo</a>');
    });

    it('should support default type on default value', () => {
        let file = read(distFolder + '/classes/TODO_STATUS.html');
        expect(file).to.contain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string"'
        );
    });

    it('should display project dependencies', () => {
        const file = exists(distFolder + '/dependencies.html');
        expect(file).to.be.true;
        let dependencies = read(distFolder + '/dependencies.html');
        expect(dependencies).to.contain('commander');
    });

    /*it('should display project peerDependencies', () => {
        const file = exists(distFolder + '/dependencies.html');
        expect(file).to.be.true;
        let dependencies = read(distFolder + '/dependencies.html');
        expect(dependencies).to.contain('angular/forms');
    });*/

    it('should support optional for classes', () => {
        let file = read(distFolder + '/classes/Todo.html');
        expect(file).to.contain('Optional');
    });

    it('should support optional for interfaces', () => {
        let file = read(distFolder + '/interfaces/LabelledTodo.html');
        expect(file).to.contain('Optional');
    });

    it('should support optional for interfaces / methods', () => {
        let file = read(distFolder + '/interfaces/TimeInterface.html');
        expect(file).to.contain('Optional');
    });

    it('should support private for constructor', () => {
        let file = read(distFolder + '/classes/PrivateConstructor.html');
        expect(file).to.contain('<span class="modifier">Private</span>');
    });

    it('should support union type with array', () => {
        let file = read(distFolder + '/components/TodoComponent.html');
        expect(file).to.contain('>string[] | Todo</a>');
    });

    it('should support multiple union types with array', () => {
        let file = read(distFolder + '/components/TodoComponent.html');
        expect(file).to.contain('<code>(string | number)[]</code>');
    });

    it('should support multiple union types with array again', () => {
        let file = read(distFolder + '/miscellaneous/typealiases.html');
        expect(file).to.contain('<code>number | string | (number | string)[]</code>');
    });

    it('should support union type with generic', () => {
        let file = read(distFolder + '/miscellaneous/typealiases.html');
        expect(file).to.contain(
            '<code>Type&lt;TableCellRendererBase&gt; | TemplateRef&lt;any&gt;</code>'
        );
    });

    it('should support multiple union types with array', () => {
        let file = read(distFolder + '/components/TodoComponent.html');
        expect(file).to.contain('<code>(string | number)[]</code>');
    });

    it('should support alone elements in their own entry menu', () => {
        let file = read(distFolder + '/index.html');
        expect(file).to.contain('<a href="./components/JigsawTab.html" >JigsawTab</a>');
        expect(file).to.contain(
            '<a href="./directives/DoNothingDirective2.html" >DoNothingDirective2</a>'
        );
        expect(file).to.contain('<a href="./injectables/EmitterService.html" >EmitterService</a>');
        expect(file).to.contain('<a href="./pipes/FirstUpperPipe2.html" >FirstUpperPipe2</a>');
    });

    it('should support component metadata preserveWhiteSpaces', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain('<td class="col-md-3">preserveWhitespaces</td>');
    });

    it('should support component metadata entryComponents', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain(
            '<code><a href="../classes/Todo.html" target="_self" >TodoComponent</a></code>'
        );
    });

    it('should support component metadata providers', () => {
        let file = read(distFolder + '/components/AboutComponent.html');
        expect(file).to.contain(
            '<code><a href="../injectables/EmitterService.html" target="_self" >EmitterService</a></code>'
        );
    });

    it('should support component inheritance with base class without @component decorator', () => {
        let file = read(distFolder + '/components/DumbComponent.html');
        expect(file).to.contain('<code>parentInput</code>');
        expect(file).to.contain('<code>parentoutput</code>');
        expect(file).to.contain('<code>style.color');
        expect(file).to.contain('<code>mouseup');
    });
});
