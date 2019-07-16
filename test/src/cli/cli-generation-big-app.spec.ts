import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI simple generation - big app', () => {
    let stdoutString = undefined;
    let clockInterfaceFile;
    let searchFuncFile;

    let todoComponentFile,
        homeComponentFile,
        aboutComponentFile,
        appComponentFile,
        listComponentFile,
        footerComponentFile,
        todoClassFile,
        tidiClassFile,
        aboutModuleFile,
        todoStoreFile,
        typeAliasesFile,
        functionsFile;

    let routesIndex;

    const tmpFolder = tmp.name + '-big-app';
    const distFolder = tmpFolder + '/documentation';

    before(done => {
        tmp.create(tmpFolder);
        tmp.copy('./test/fixtures/todomvc-ng2/', tmpFolder);
        let ls = shell(
            'node',
            ['../bin/index-cli.js', '-p', './src/tsconfig.json', '-d', 'documentation'],
            { cwd: tmpFolder }
        );

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
        homeComponentFile = read(`${distFolder}/components/HomeComponent.html`);
        aboutComponentFile = read(`${distFolder}/components/AboutComponent.html`);
        appComponentFile = read(`${distFolder}/components/AppComponent.html`);
        listComponentFile = read(`${distFolder}/components/ListComponent.html`);

        todoClassFile = read(`${distFolder}/classes/Todo.html`);
        tidiClassFile = read(`${distFolder}/classes/Tidi.html`);

        aboutModuleFile = read(`${distFolder}/modules/AboutModule.html`);

        todoStoreFile = read(`${distFolder}/injectables/TodoStore.html`);

        typeAliasesFile = read(`${distFolder}/miscellaneous/typealiases.html`);
        functionsFile = read(`${distFolder}/miscellaneous/functions.html`);

        done();
    });
    after(() => {
        tmp.clean(distFolder);
    });

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

    it('should add correct path to css', () => {
        let index = read(`${distFolder}/index.html`);
        expect(index).to.contain('href="./styles/style.css"');
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
        expect(footerComponentFile).to.contain('@LogProperty()<br');
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
        expect(todoClassFile).to.contain('Extends');
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

    it('should have generated the not-injectable guards', () => {
        const file = exists(`${distFolder}/guards/AuthGuard.html`);

        expect(file).to.be.true;
    });

    it('should have generated the injectable guards', () => {
        const file = exists(`${distFolder}/guards/NotAuthGuard.html`);

        expect(file).to.be.true;
    });

    it(`shouldn't have generated classes for the corresponding guards`, () => {
        const file = exists(`${distFolder}/classes/AuthGuard.html`);

        expect(file).to.be.false;
    });

    it(`shouldn't have generated injectables for the corresponding guards`, () => {
        const file = exists(`${distFolder}/injectables/NotAuthGuard.html`);

        expect(file).to.be.false;
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
        expect(todoStoreFile).to.contain('Promise&lt;void&gt;');
        expect(todoStoreFile).to.contain('string | number');
        expect(todoStoreFile).to.contain('number[]');
        expect(todoStoreFile).to.contain(
            '<code>stopMonitoring(theTodo?: <a href="../interfaces/LabelledTodo.html">LabelledTodo</a>)</code>'
        );
        expect(todoStoreFile).to.contain('service is a todo store');
        expect(todoStoreFile).to.contain('all todos status (completed');
        expect(todoStoreFile).to.contain('Local array of Todos');
    });

    it('should have correct types for todo model', () => {
        expect(todoClassFile).to.contain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/boolean'
        );
        expect(todoClassFile).to.contain(
            'testCommentFunction(dig: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number'
        );
    });

    it('should have correct spread support', () => {
        expect(todoStoreFile).to.contain('...theArgs');
    });

    it('should have an example tab', () => {
        expect(todoComponentFile).to.contain('data-link="example">Examples</a');
        expect(todoComponentFile).to.contain('iframe class="exampleContainer"');
    });

    it('should have managed array declaration in modules', () => {
        const file = read(distFolder + '/modules/TodoModule.html');
        expect(file).to.contain('<title>FirstUpperPipe</title>'); // Inside svg graph
        const file2 = read(distFolder + '/modules/ListModule.html');
        expect(file2).to.contain('<title>TodoModule</title>'); // Inside svg graph
    });

    it('should have README tabs for each types', () => {
        expect(todoComponentFile).to.contain('id="readme-tab"');
        expect(aboutModuleFile).to.contain('id="readme-tab"');
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.contain('id="readme-tab"');
        expect(todoStoreFile).to.contain('id="readme-tab"');
        file = read(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).to.contain('id="readme-tab"');

        expect(todoClassFile).to.contain('id="readme-tab"');

        file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).to.contain('id="readme-tab"');
    });

    it('should support indexable for class', () => {
        expect(todoClassFile).to.contain('<code>[index: number]');
    });

    it('should have correct links for {@link into main description and constructor}', () => {
        expect(todoClassFile).to.contain('See <a href="../injectables/TodoStore');
        expect(todoClassFile).to.contain('Watch <a href="../injectables/TodoStore');
    });

    it('should support misc links', () => {
        expect(todoClassFile).to.contain('../miscellaneous/enumerations.html');
    });

    it('should have public function for component', () => {
        expect(homeComponentFile).to.contain('code>showTab(');
    });

    it('should have override types for arguments of function', () => {
        expect(todoStoreFile).to.contain('code><a href="../classes/Todo.html" target="_self" >To');
    });

    it('should have inherreturn type', () => {
        expect(todoClassFile).to.contain(
            'code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number"'
        );
    });

    it('should support simple class with custom decorator', () => {
        expect(tidiClassFile).to.contain('completed</b>');
    });

    it('should support simple class with custom decorator()', () => {
        let file = read(distFolder + '/classes/DoNothing.html');
        expect(file).to.contain('aname</b>');
    });

    it('should support TypeLiteral', () => {
        expect(typeAliasesFile).to.contain(
            '&quot;creating&quot; | &quot;created&quot; | &quot;updating&quot; | &quot;updated&quot'
        );
    });

    it('should support return multiple with null & TypeLiteral', () => {
        expect(tidiClassFile).to.contain('<code>literal type | null');
    });

    it('should support @HostBindings', () => {
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.contain('style.color</b>');
    });

    it('should support @HostListener', () => {
        expect(aboutComponentFile).to.contain('<code>mouseup(mouseX');
        expect(aboutComponentFile).to.contain("i>Arguments : </i><code>'$event.clientX");
    });

    it('should support extends for interface', () => {
        let file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).to.contain('Extends');
    });

    it('should support optional', () => {
        expect(todoStoreFile).to.contain('Yes');
    });

    it('should support optional', () => {
        expect(aboutComponentFile).to.contain('<code>Subscription[]');
    });

    it('should support @link with anchor', () => {
        expect(todoStoreFile).to.contain('../classes/Todo.html#completed');
    });

    it('should support self-defined type', () => {
        expect(todoClassFile).to.contain('../miscellaneous/typealiases.html#PopupPosition');
        expect(typeAliasesFile).to.contain('<code>ElementRef | HTMLElement</code>');
    });

    it('should support accessors for class', () => {
        expect(todoClassFile).to.contain('<a href="#title">title</a>');
        expect(todoClassFile).to.contain('Accessors');
        expect(todoClassFile).to.contain('Setter of _title');
        expect(todoClassFile).to.contain('<p>Returns the runtime path</p>');
        expect(todoClassFile).to.contain('<code>title(value');
    });

    it('should support accessors for injectables', () => {
        expect(todoStoreFile).to.contain('Accessors');
        expect(todoStoreFile).to.contain('Getter of _fullName');
        expect(todoStoreFile).to.contain('Setter of _fullName');
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
        expect(aboutComponentFile).to.contain('Highcharts.Options');
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

        expect(functionsFile).to.contain('foo2');

        expect(typeAliasesFile).to.contain('Name2');

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
        expect(homeComponentFile).to.contain('<header class="header"');
    });

    it('should have parsed correctly private, public, and static methods or properties', () => {
        expect(aboutComponentFile).to.contain('<code>privateStaticMethod()');
        expect(aboutComponentFile).to.contain(
            `<span class="modifier">Private</span>\n                                    <span class="modifier">Static</span>`
        );
        expect(aboutComponentFile).to.contain('<code>protectedStaticMethod()');
        expect(aboutComponentFile).to.contain(
            `<span class="modifier">Protected</span>\n                                    <span class="modifier">Static</span>`
        );
        expect(aboutComponentFile).to.contain('<code>publicMethod()');
        expect(aboutComponentFile).to.contain('<code>publicStaticMethod()');
        expect(aboutComponentFile).to.contain('<code>staticMethod()');
        expect(aboutComponentFile).to.contain('staticReadonlyVariable');
        expect(aboutComponentFile).to.contain(
            `<span class="modifier">Static</span>\n                                    <span class="modifier">Readonly</span>`
        );
        expect(aboutComponentFile).to.contain(
            `<span class="modifier">Public</span>\n                                    <span class="modifier">Async</span>`
        );
    });

    it('should support entryComponents for modules', () => {
        expect(aboutModuleFile).to.contain('<h3>EntryComponents');
        expect(aboutModuleFile).to.contain('href="../components/AboutComponent.html"');
    });

    it('should id for modules', () => {
        expect(aboutModuleFile).to.contain('<h3>Id');
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
        expect(aboutModuleFile).to.contain('<h3>Declarations');
        expect(aboutModuleFile).to.contain('<h3>Imports');
        expect(aboutModuleFile).to.contain('<h3>EntryComponents');
        expect(aboutModuleFile).to.contain('<h3>Providers');
        expect(aboutModuleFile).to.contain('<h3>Bootstrap');
        expect(aboutModuleFile).to.contain('<h3>Schemas');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for components', () => {
        expect(homeComponentFile).to.contain('<h3>Metadata');
        expect(homeComponentFile).to.contain('<code>home</code>');
        expect(homeComponentFile).to.contain('<code>ChangeDetectionStrategy.OnPush</code>');
        expect(homeComponentFile).to.contain('<code>ViewEncapsulation.Emulated</code>');
        expect(homeComponentFile).to.contain('<code>./home.component.html</code>');
        expect(homeComponentFile).to.contain('<td class="col-md-3">template</td>');
    });

    it('should support @link to miscellaneous', () => {
        expect(aboutComponentFile).to.contain(
            '<a href="../miscellaneous/variables.html#PIT">PIT</a>'
        );
        expect(aboutComponentFile).to.contain(
            '<a href="../miscellaneous/enumerations.html#Direction">Direction</a>'
        );
        expect(aboutComponentFile).to.contain(
            '<a href="../miscellaneous/typealiases.html#ChartChange">ChartChange</a>'
        );
        expect(aboutComponentFile).to.contain(
            '<a href="../miscellaneous/functions.html#foo">foo</a>'
        );
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
        expect(dependencies).to.contain('angular/forms');
    });

    it('should display project local TypeScript version', () => {
        expect(stdoutString).to.contain('TypeScript version of current project');
    });

    /*it('should display project peerDependencies', () => {
        const file = exists(distFolder + '/dependencies.html');
        expect(file).to.be.true;
        let dependencies = read(distFolder + '/dependencies.html');
        expect(dependencies).to.contain('angular/forms');
    });*/

    it('should support optional for classes', () => {
        expect(todoClassFile).to.contain('Optional');
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
        expect(todoComponentFile).to.contain('>string[] | Todo</a>');
    });

    it('should support multiple union types with array', () => {
        expect(todoComponentFile).to.contain('<code>(string | number)[]</code>');
    });

    it('should support multiple union types with array again', () => {
        expect(typeAliasesFile).to.contain('<code>number | string | (number | string)[]</code>');
    });

    it('should support union type with generic', () => {
        expect(typeAliasesFile).to.contain(
            '<code>Type&lt;TableCellRendererBase&gt; | TemplateRef&lt;any&gt;</code>'
        );
    });

    it('should support literal type', () => {
        expect(typeAliasesFile).to.contain(
            '<code>Pick&lt;NavigationExtras | replaceUrl&gt;</code>'
        );
    });

    it('should support multiple union types with array', () => {
        expect(todoComponentFile).to.contain('<code>(string | number)[]</code>');
    });

    it('should support alone elements in their own entry menu', () => {
        let file = read(distFolder + '/js/menu-wc.js');
        expect(file).to.contain(
            '<a href="components/JigsawTab.html" data-type="entity-link">JigsawTab</a>'
        );
        expect(file).to.contain(
            '<a href="directives/DoNothingDirective2.html" data-type="entity-link">DoNothingDirective2</a>'
        );
        expect(file).to.contain(
            '<a href="injectables/EmitterService.html" data-type="entity-link">EmitterService</a>'
        );
        expect(file).to.contain(
            '<a href="pipes/FirstUpperPipe2.html" data-type="entity-link">FirstUpperPipe2</a>'
        );
    });

    it('should support component metadata preserveWhiteSpaces', () => {
        expect(aboutComponentFile).to.contain('<td class="col-md-3">preserveWhitespaces</td>');
    });

    it('should support component metadata entryComponents', () => {
        expect(aboutComponentFile).to.contain(
            '<code><a href="../classes/Todo.html" target="_self" >TodoComponent</a></code>'
        );
    });

    it('should support component metadata providers', () => {
        expect(aboutComponentFile).to.contain(
            '<code><a href="../injectables/EmitterService.html" target="_self" >EmitterService</a></code>'
        );
    });

    it('should support component inheritance with base class without @component decorator', () => {
        let file = read(distFolder + '/components/DumbComponent.html');
        expect(file).to.contain('parentInput</b>');
        expect(file).to.contain('parentoutput</b>');
        expect(file).to.contain('style.color</b>');
        expect(file).to.contain('<code>mouseup');
    });

    it('should display short filename + long filename in title for index of miscellaneous', () => {
        let file = read(distFolder + '/miscellaneous/variables.html');
        expect(file).to.contain('(src/.../about.module.ts)');
        expect(file).to.contain('title="src/app/about/about.module.ts"');
    });

    it('should display component even with no hostlisteners', () => {
        let file = read(distFolder + '/coverage.html');
        expect(file).to.contain('src/app/footer/footer.component.ts');
    });

    it('should display list of import/exports/declarations/providers in asc order', () => {
        let file = read(distFolder + '/modules/AboutRoutingModule.html');
        expect(file).to.contain(
            `<li class="list-group-item">\n                            <a href="../components/CompodocComponent.html">CompodocComponent</a>\n                        </li>\n                        <li class="list-group-item">\n                            <a href="../components/TodoMVCComponent.html">`
        );
    });

    it('should support Tuple types', () => {
        expect(typeAliasesFile).to.contain('<code>[Number, Number]</code>');
        expect(typeAliasesFile).to.contain('[Todo, Todo]</a>');
    });

    it('should support Generic array types', () => {
        expect(appComponentFile).to.contain(
            '<a href="../classes/Todo.html" target="_self" >Observable&lt;Todo[]&gt;</a>'
        );
    });

    it('should support Type parameters', () => {
        expect(appComponentFile).to.contain(
            `<ul class="type-parameters">\n                        <li>T</li>\n                        <li>K</li>\n                    </ul>`
        );
    });

    it('should support spread elements with external variables', () => {
        let file = read(distFolder + '/modules/FooterModule.html');
        expect(file).to.contain('<h3>Declarations<a href=');
    });

    it('should support interfaces with custom variables names', () => {
        let file = read(distFolder + '/interfaces/ValueInRes.html');
        expect(file).to.contain('<a href="#__allAnd">');
    });

    it('correct support of generic type Map<K, V>', () => {
        expect(todoStoreFile).to.contain('Map&lt;string, number&gt;');
    });

    it('correct support of abstract and async modifiers', () => {
        expect(todoClassFile).to.contain('<span class="modifier">Abstract</span>');
        expect(todoClassFile).to.contain('<span class="modifier">Async</span>');
    });

    it('correct support function with empty typed arguments', () => {
        expect(appComponentFile).to.contain('<code>openSomeDialog(model,');
    });

    it('correct support unnamed function', () => {
        expect(functionsFile).to.contain('Unnamed');
    });

    it('correct display styles tab', () => {
        let file = read(distFolder + '/components/HeaderComponent.html');
        expect(file).to.contain('styleData-tab');
        expect(file).to.contain('language-scss');
        expect(appComponentFile).to.contain('styleData-tab');
        expect(appComponentFile).to.contain('font-size');
        file = read(distFolder + '/components/TodoMVCComponent.html');
        expect(file).to.contain('styleData-tab');
        expect(file).to.contain('pointer-events');
    });

    it('correct support symbol type', () => {
        expect(typeAliasesFile).to.contain('string | symbol | Array&lt;string | symbol&gt;');
    });

    it('correct support gorRoot & forChild methods for modules', () => {
        let file = read(distFolder + '/modules/AppModule.html');
        expect(file).to.contain('code>forChild(confi');
        expect(file).to.contain('code>forRoot(confi');
    });

    it('correct support returned type for miscellaneous function', () => {
        expect(functionsFile).to.contain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string'
        );
    });

    it('correct http reference for other classes using @link in description of a miscellaneous function', () => {
        expect(functionsFile).to.contain(
            '<a href="../components/ListComponent.html">ListComponent</a>'
        );
    });

    it('shorten long arrow function declaration for properties', () => {
        expect(todoClassFile).to.contain('() &#x3D;&gt; {...}</code>');
    });

    it('correct supports 1000 as PollingSpeed for decorator arguments', () => {
        let file = read(distFolder + '/classes/SomeFeature.html');
        expect(file).to.contain('code>@throttle(1000 as PollingSpeed');
    });

    it('correct supports JSdoc without comment for accessor', () => {
        expect(tidiClassFile).to.contain('b>emailAddress</b>');
    });
});
