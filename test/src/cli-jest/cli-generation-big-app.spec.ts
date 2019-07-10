import { exists, read, shell, temporaryDir } from '../helpers';

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

    beforeEach(done => {
        tmp.create(tmpFolder);
        tmp.copy('./test/src/todomvc-ng2/', tmpFolder);
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
    afterEach(() => {
        tmp.clean(distFolder);
    });

    it('should display generated message', () => {
        expect(stdoutString).toContain('Documentation generated');
    });

    it('should have generated main folder', () => {
        const isFolderExists = exists(distFolder);
        expect(isFolderExists).toBeTruthy();
    });

    it('should have generated main pages', () => {
        const isIndexExists = exists(distFolder + '/index.html');
        expect(isIndexExists).toBeTruthy();
        const isModulesExists = exists(distFolder + '/modules.html');
        expect(isModulesExists).toBeTruthy();
        const isRoutesExists = exists(distFolder + '/routes.html');
        expect(isRoutesExists).toBeTruthy();
    });

    it('should have generated resources folder', () => {
        const isImagesExists = exists(distFolder + '/images');
        expect(isImagesExists).toBeTruthy();
        const isJSExists = exists(distFolder + '/js');
        expect(isJSExists).toBeTruthy();
        const isStylesExists = exists(distFolder + '/styles');
        expect(isStylesExists).toBeTruthy();
        const isFontsExists = exists(distFolder + '/fonts');
        expect(isFontsExists).toBeTruthy();
    });

    it('should add correct path to css', () => {
        let index = read(`${distFolder}/index.html`);
        expect(index).toContain('href="./styles/style.css"');
    });

    /**
     * Dynamic imports for metadatas
     */
    it('should have metadatas - component', () => {
        expect(footerComponentFile).toContain('footer.component.html');
    });
    it('should have metadatas - component with aliased import', () => {
        const file = read(`${distFolder}/components/HeaderComponent.html`);
        expect(file).toContain('header.component.html');
    });
    it('should have metadatas - directive', () => {
        const file = read(`${distFolder}/directives/DoNothingDirective.html`);
        expect(file).toContain('[donothing]');
    });

    /**
     * Routing
     */

    it('should not have a toggled item menu', () => {
        expect(routesIndex).toEqual(expect.not.stringContaining('fa-angle-down'));
    });

    it('should have a route index', () => {
        const isFileExists = exists(`${distFolder}/js/routes/routes_index.js`);
        expect(isFileExists).toBeTruthy();
    });

    it('should have generated files', () => {
        expect(routesIndex).toContain('AppModule');
        expect(routesIndex).toContain('AppRoutingModule');
        expect(routesIndex).toContain('HomeRoutingModule');
        expect(routesIndex).toContain('AboutComponent');
    });

    it('should have a readme tab', () => {
        expect(todoComponentFile).toContain('readme-tab');
        expect(listComponentFile).toContain('readme-tab');
    });

    it('should have a decorator listed', () => {
        expect(footerComponentFile).toContain('@LogProperty()<br');
    });

    /**
     * End Routing
     */

    it('should have generated search index json', () => {
        const isIndexExists = exists(`${distFolder}/js/search/search_index.js`);
        expect(isIndexExists).toBeTruthy();
    });

    it('should have excluded big file for search index json', () => {
        const searchIndexFile = read(`${distFolder}/js/search/search_index.js`);
        expect(searchIndexFile).toEqual(expect.not.stringContaining('photo64_1'));
    });

    it('should have generated extends information for todo class', () => {
        expect(todoClassFile).toContain('Extends');
    });

    it('should have generated implements information for clock class', () => {
        const classFile = read(`${distFolder}/classes/Clock.html`);
        expect(classFile).toContain('Implements');
    });

    it('should have generated interfaces', () => {
        const isInterfaceExists = exists(distFolder + '/interfaces/ClockInterface.html');
        expect(isInterfaceExists).toBeTruthy();
    });

    it('should have generated classes', () => {
        const clockFile = exists(distFolder + '/classes/Clock.html');
        expect(clockFile).toBeTruthy();
    });

    it('should have generated components', () => {
        const file = exists(distFolder + '/components/AboutComponent.html');
        expect(file).toBeTruthy();
    });

    it('should have generated directives', () => {
        const file = exists(distFolder + '/directives/DoNothingDirective.html');
        expect(file).toBeTruthy();
    });

    it('should have generated injectables', () => {
        const file = exists(distFolder + '/injectables/TodoStore.html');
        expect(file).toBeTruthy();
    });

    it('should have generated the not-injectable guards', () => {
        const file = exists(`${distFolder}/guards/AuthGuard.html`);

        expect(file).toBeTruthy();
    });

    it('should have generated the injectable guards', () => {
        const file = exists(`${distFolder}/guards/NotAuthGuard.html`);

        expect(file).toBeTruthy();
    });

    it(`shouldn't have generated classes for the corresponding guards`, () => {
        const file = exists(`${distFolder}/classes/AuthGuard.html`);

        expect(file).toBeFalsy();
    });

    it(`shouldn't have generated injectables for the corresponding guards`, () => {
        const file = exists(`${distFolder}/injectables/NotAuthGuard.html`);

        expect(file).toBeFalsy();
    });

    it('should have generated modules', () => {
        const file = exists(distFolder + '/modules/AboutModule.html');
        expect(file).toBeTruthy();
    });

    it('should have generated pipes', () => {
        const file = exists(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).toBeTruthy();

        const pipeFile = read(distFolder + '/pipes/FirstUpperPipe.html');
        expect(pipeFile).toContain('<h3>Metadata');
        expect(pipeFile).toContain('Example property');
        expect(pipeFile).toContain('the transform function');
        expect(pipeFile).toContain('<td class="col-md-9">true</td>');
        expect(pipeFile).toContain('<td class="col-md-9">firstUpper</td>');
    });

    it('should have miscellaneous page', () => {
        const file = exists(distFolder + '/miscellaneous/enumerations.html');
        expect(file).toBeTruthy();
    });

    it('miscellaneous page should contain some things', () => {
        const miscFile = read(`${distFolder}/miscellaneous/enumerations.html`);
        expect(miscFile).toContain('Directions of the app');
    });

    it('should have infos about SearchFunc interface', () => {
        expect(searchFuncFile).toContain('A string');
    });

    it('should have infos about ClockInterface interface', () => {
        const file = read(`${distFolder}/interfaces/ClockInterface.html`);
        expect(file).toContain('A simple reset method');
    });

    it('should have generated args and return informations for todo store', () => {
        expect(todoStoreFile).toContain('Promise&lt;void&gt;');
        expect(todoStoreFile).toContain('string | number');
        expect(todoStoreFile).toContain('number[]');
        expect(todoStoreFile).toContain(
            '<code>stopMonitoring(theTodo?: <a href="../interfaces/LabelledTodo.html">LabelledTodo</a>)</code>'
        );
        expect(todoStoreFile).toContain('service is a todo store');
        expect(todoStoreFile).toContain('all todos status (completed');
        expect(todoStoreFile).toContain('Local array of Todos');
    });

    it('should have correct types for todo model', () => {
        expect(todoClassFile).toContain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/boolean'
        );
        expect(todoClassFile).toContain(
            'testCommentFunction(dig: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number'
        );
    });

    it('should have correct spread support', () => {
        expect(todoStoreFile).toContain('...theArgs');
    });

    it('should have an example tab', () => {
        expect(todoComponentFile).toContain('data-link="example">Examples</a');
        expect(todoComponentFile).toContain('iframe class="exampleContainer"');
    });

    it('should have managed array declaration in modules', () => {
        const file = read(distFolder + '/modules/TodoModule.html');
        expect(file).toContain('<title>FirstUpperPipe</title>'); // Inside svg graph
        const file2 = read(distFolder + '/modules/ListModule.html');
        expect(file2).toContain('<title>TodoModule</title>'); // Inside svg graph
    });

    it('should have README tabs for each types', () => {
        expect(todoComponentFile).toContain('id="readme-tab"');
        expect(aboutModuleFile).toContain('id="readme-tab"');
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).toContain('id="readme-tab"');
        expect(todoStoreFile).toContain('id="readme-tab"');
        file = read(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).toContain('id="readme-tab"');

        expect(todoClassFile).toContain('id="readme-tab"');

        file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).toContain('id="readme-tab"');
    });

    it('should support indexable for class', () => {
        expect(todoClassFile).toContain('<code>[index: number]');
    });

    it('should have correct links for {@link into main description and constructor}', () => {
        expect(todoClassFile).toContain('See <a href="../injectables/TodoStore');
        expect(todoClassFile).toContain('Watch <a href="../injectables/TodoStore');
    });

    it('should support misc links', () => {
        expect(todoClassFile).toContain('../miscellaneous/enumerations.html');
    });

    it('should have public function for component', () => {
        expect(homeComponentFile).toContain('code>showTab(');
    });

    it('should have override types for arguments of function', () => {
        expect(todoStoreFile).toContain('code><a href="../classes/Todo.html" target="_self" >To');
    });

    it('should have inherreturn type', () => {
        expect(todoClassFile).toContain(
            'code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number"'
        );
    });

    it('should support simple class with custom decorator', () => {
        expect(tidiClassFile).toContain('completed</b>');
    });

    it('should support simple class with custom decorator()', () => {
        let file = read(distFolder + '/classes/DoNothing.html');
        expect(file).toContain('aname</b>');
    });

    it('should support TypeLiteral', () => {
        expect(typeAliasesFile).toContain(
            '&quot;creating&quot; | &quot;created&quot; | &quot;updating&quot; | &quot;updated&quot'
        );
    });

    it('should support return multiple with null & TypeLiteral', () => {
        expect(tidiClassFile).toContain('<code>literal type | null');
    });

    it('should support @HostBindings', () => {
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).toContain('style.color</b>');
    });

    it('should support @HostListener', () => {
        expect(aboutComponentFile).toContain('<code>mouseup(mouseX');
        expect(aboutComponentFile).toContain("i>Arguments : </i><code>'$event.clientX");
    });

    it('should support extends for interface', () => {
        let file = read(distFolder + '/interfaces/ClockInterface.html');
        expect(file).toContain('Extends');
    });

    it('should support optional', () => {
        expect(todoStoreFile).toContain('Yes');
    });

    it('should support optional', () => {
        expect(aboutComponentFile).toContain('<code>Subscription[]');
    });

    it('should support @link with anchor', () => {
        expect(todoStoreFile).toContain('../classes/Todo.html#completed');
    });

    it('should support self-defined type', () => {
        expect(todoClassFile).toContain('../miscellaneous/typealiases.html#PopupPosition');
        expect(typeAliasesFile).toContain('<code>ElementRef | HTMLElement</code>');
    });

    it('should support accessors for class', () => {
        expect(todoClassFile).toContain('<a href="#title">title</a>');
        expect(todoClassFile).toContain('Accessors');
        expect(todoClassFile).toContain('Setter of _title');
        expect(todoClassFile).toContain('<p>Returns the runtime path</p>');
        expect(todoClassFile).toContain('<code>title(value');
    });

    it('should support accessors for injectables', () => {
        expect(todoStoreFile).toContain('Accessors');
        expect(todoStoreFile).toContain('Getter of _fullName');
        expect(todoStoreFile).toContain('Setter of _fullName');
    });

    it('should support accessors for directives', () => {
        let file = read(distFolder + '/directives/DoNothingDirective.html');
        expect(file).toContain('Accessors');
        expect(file).toContain('Getter of _fullName');
        expect(file).toContain('Setter of _fullName');
    });

    it('should support accessors for components with input', () => {
        let file = read(distFolder + '/components/HeaderComponent.html');
        expect(file).toContain('Accessors');
        expect(file).toContain('Getter of _fullName');
        expect(file).toContain('Setter of _fullName');

        expect(file).toContain('Inputs');
    });

    it('should support QualifiedName for type', () => {
        expect(aboutComponentFile).toContain('Highcharts.Options');
    });

    it('should support namespace', () => {
        let file = read(distFolder + '/modules/AboutModule2.html');
        expect(file).toContain('The about module');

        file = read(distFolder + '/components/AboutComponent2.html');
        expect(file).toContain('The about component');

        file = read(distFolder + '/directives/DoNothingDirective2.html');
        expect(file).toContain('This directive does nothing !');

        file = read(distFolder + '/classes/Todo2.html');
        expect(file).toContain('The todo class');

        file = read(distFolder + '/injectables/TodoStore2.html');
        expect(file).toContain('This service is a todo store');

        file = read(distFolder + '/interfaces/TimeInterface2.html');
        expect(file).toContain('A time interface just for documentation purpose');

        file = read(distFolder + '/pipes/FirstUpperPipe2.html');
        expect(file).toContain('Uppercase the first letter of the string');

        file = read(distFolder + '/miscellaneous/enumerations.html');
        expect(file).toContain('PopupEffect2');

        expect(functionsFile).toContain('foo2');

        expect(typeAliasesFile).toContain('Name2');

        file = read(distFolder + '/miscellaneous/variables.html');
        expect(file).toContain('PI2');
    });

    it('should support spread operator for modules metadatas', () => {
        let file = read(distFolder + '/modules/HomeModule.html');
        expect(file).toContain('../modules/FooterModule.html');
    });

    it('should support interceptors', () => {
        let file = read(distFolder + '/modules/AppModule.html');
        expect(file).toContain('../interceptors/NoopInterceptor.html');
        const fileTest = exists(distFolder + '/interceptors/NoopInterceptor.html');
        expect(fileTest).toBeTruthy();
    });

    it('should have DOM tree tab for component with inline template', () => {
        expect(homeComponentFile).toContain('<header class="header"');
    });

    it('should have parsed correctly private, public, and static methods or properties', () => {
        expect(aboutComponentFile).toContain('<code>privateStaticMethod()');
        expect(aboutComponentFile).toContain(
            `<span class="modifier">Private</span>\n                                    <span class="modifier">Static</span>`
        );
        expect(aboutComponentFile).toContain('<code>protectedStaticMethod()');
        expect(aboutComponentFile).toContain(
            `<span class="modifier">Protected</span>\n                                    <span class="modifier">Static</span>`
        );
        expect(aboutComponentFile).toContain('<code>publicMethod()');
        expect(aboutComponentFile).toContain('<code>publicStaticMethod()');
        expect(aboutComponentFile).toContain('<code>staticMethod()');
        expect(aboutComponentFile).toContain('staticReadonlyVariable');
        expect(aboutComponentFile).toContain(
            `<span class="modifier">Static</span>\n                                    <span class="modifier">Readonly</span>`
        );
        expect(aboutComponentFile).toContain(
            `<span class="modifier">Public</span>\n                                    <span class="modifier">Async</span>`
        );
    });

    it('should support entryComponents for modules', () => {
        expect(aboutModuleFile).toContain('<h3>EntryComponents');
        expect(aboutModuleFile).toContain('href="../components/AboutComponent.html"');
    });

    it('should id for modules', () => {
        expect(aboutModuleFile).toContain('<h3>Id');
    });

    it('should schemas for modules', () => {
        let file = read(distFolder + '/modules/FooterModule.html');
        expect(file).toContain('<h3>Schemas');
    });

    it('should support dynamic path for routes', () => {
        let routesFile = read(distFolder + '/js/routes/routes_index.js');
        expect(routesFile).toContain('homeimported');
        expect(routesFile).toContain('homeenumimported');
        expect(routesFile).toContain('homeenuminfile');
        expect(routesFile).toContain('todomvcinstaticclass');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for modules', () => {
        expect(aboutModuleFile).toContain('<h3>Declarations');
        expect(aboutModuleFile).toContain('<h3>Imports');
        expect(aboutModuleFile).toContain('<h3>EntryComponents');
        expect(aboutModuleFile).toContain('<h3>Providers');
        expect(aboutModuleFile).toContain('<h3>Bootstrap');
        expect(aboutModuleFile).toContain('<h3>Schemas');
    });

    it('should support Object Literal Property Value Shorthand support for metadatas for components', () => {
        expect(homeComponentFile).toContain('<h3>Metadata');
        expect(homeComponentFile).toContain('<code>home</code>');
        expect(homeComponentFile).toContain('<code>ChangeDetectionStrategy.OnPush</code>');
        expect(homeComponentFile).toContain('<code>ViewEncapsulation.Emulated</code>');
        expect(homeComponentFile).toContain('<code>./home.component.html</code>');
        expect(homeComponentFile).toContain('<td class="col-md-3">template</td>');
    });

    it('should support @link to miscellaneous', () => {
        expect(aboutComponentFile).toContain(
            '<a href="../miscellaneous/variables.html#PIT">PIT</a>'
        );
        expect(aboutComponentFile).toContain(
            '<a href="../miscellaneous/enumerations.html#Direction">Direction</a>'
        );
        expect(aboutComponentFile).toContain(
            '<a href="../miscellaneous/typealiases.html#ChartChange">ChartChange</a>'
        );
        expect(aboutComponentFile).toContain(
            '<a href="../miscellaneous/functions.html#foo">foo</a>'
        );
    });

    it('should support default type on default value', () => {
        let file = read(distFolder + '/classes/TODO_STATUS.html');
        expect(file).toContain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string"'
        );
    });

    it('should display project dependencies', () => {
        const file = exists(distFolder + '/dependencies.html');
        expect(file).toBeTruthy();
        let dependencies = read(distFolder + '/dependencies.html');
        expect(dependencies).toContain('angular/forms');
    });

    it('should display project local TypeScript version', () => {
        expect(stdoutString).toContain('TypeScript version of current project');
    });

    /*it('should display project peerDependencies', () => {
        const file = exists(distFolder + '/dependencies.html');
        expect(file).toBeTruthy();
        let dependencies = read(distFolder + '/dependencies.html');
        expect(dependencies).toContain('angular/forms');
    });*/

    it('should support optional for classes', () => {
        expect(todoClassFile).toContain('Optional');
    });

    it('should support optional for interfaces', () => {
        let file = read(distFolder + '/interfaces/LabelledTodo.html');
        expect(file).toContain('Optional');
    });

    it('should support optional for interfaces / methods', () => {
        let file = read(distFolder + '/interfaces/TimeInterface.html');
        expect(file).toContain('Optional');
    });

    it('should support private for constructor', () => {
        let file = read(distFolder + '/classes/PrivateConstructor.html');
        expect(file).toContain('<span class="modifier">Private</span>');
    });

    it('should support union type with array', () => {
        expect(todoComponentFile).toContain('>string[] | Todo</a>');
    });

    it('should support multiple union types with array', () => {
        expect(todoComponentFile).toContain('<code>(string | number)[]</code>');
    });

    it('should support multiple union types with array again', () => {
        expect(typeAliasesFile).toContain('<code>number | string | (number | string)[]</code>');
    });

    it('should support union type with generic', () => {
        expect(typeAliasesFile).toContain(
            '<code>Type&lt;TableCellRendererBase&gt; | TemplateRef&lt;any&gt;</code>'
        );
    });

    it('should support literal type', () => {
        expect(typeAliasesFile).toContain('<code>Pick&lt;NavigationExtras | replaceUrl&gt;</code>');
    });

    it('should support multiple union types with array', () => {
        expect(todoComponentFile).toContain('<code>(string | number)[]</code>');
    });

    it('should support alone elements in their own entry menu', () => {
        let file = read(distFolder + '/js/menu-wc.js');
        expect(file).toContain(
            '<a href="components/JigsawTab.html" data-type="entity-link">JigsawTab</a>'
        );
        expect(file).toContain(
            '<a href="directives/DoNothingDirective2.html" data-type="entity-link">DoNothingDirective2</a>'
        );
        expect(file).toContain(
            '<a href="injectables/EmitterService.html" data-type="entity-link">EmitterService</a>'
        );
        expect(file).toContain(
            '<a href="pipes/FirstUpperPipe2.html" data-type="entity-link">FirstUpperPipe2</a>'
        );
    });

    it('should support component metadata preserveWhiteSpaces', () => {
        expect(aboutComponentFile).toContain('<td class="col-md-3">preserveWhitespaces</td>');
    });

    it('should support component metadata entryComponents', () => {
        expect(aboutComponentFile).toContain(
            '<code><a href="../classes/Todo.html" target="_self" >TodoComponent</a></code>'
        );
    });

    it('should support component metadata providers', () => {
        expect(aboutComponentFile).toContain(
            '<code><a href="../injectables/EmitterService.html" target="_self" >EmitterService</a></code>'
        );
    });

    it('should support component inheritance with base class without @component decorator', () => {
        let file = read(distFolder + '/components/DumbComponent.html');
        expect(file).toContain('parentInput</b>');
        expect(file).toContain('parentoutput</b>');
        expect(file).toContain('style.color</b>');
        expect(file).toContain('<code>mouseup');
    });

    it('should display short filename + long filename in title for index of miscellaneous', () => {
        let file = read(distFolder + '/miscellaneous/variables.html');
        expect(file).toContain('(src/.../about.module.ts)');
        expect(file).toContain('title="src/app/about/about.module.ts"');
    });

    it('should display component even with no hostlisteners', () => {
        let file = read(distFolder + '/coverage.html');
        expect(file).toContain('src/app/footer/footer.component.ts');
    });

    it('should display list of import/exports/declarations/providers in asc order', () => {
        let file = read(distFolder + '/modules/AboutRoutingModule.html');
        expect(file).toContain(
            `<li class="list-group-item">\n                            <a href="../components/CompodocComponent.html">CompodocComponent</a>\n                        </li>\n                        <li class="list-group-item">\n                            <a href="../components/TodoMVCComponent.html">`
        );
    });

    it('should support Tuple types', () => {
        expect(typeAliasesFile).toContain('<code>[Number, Number]</code>');
        expect(typeAliasesFile).toContain('[Todo, Todo]</a>');
    });

    it('should support Generic array types', () => {
        expect(appComponentFile).toContain(
            '<a href="../classes/Todo.html" target="_self" >Observable&lt;Todo[]&gt;</a>'
        );
    });

    it('should support Type parameters', () => {
        expect(appComponentFile).toContain(
            `<ul class="type-parameters">\n                        <li>T</li>\n                        <li>K</li>\n                    </ul>`
        );
    });

    it('should support spread elements with external variables', () => {
        let file = read(distFolder + '/modules/FooterModule.html');
        expect(file).toContain('<h3>Declarations<a href=');
    });

    it('should support interfaces with custom variables names', () => {
        let file = read(distFolder + '/interfaces/ValueInRes.html');
        expect(file).toContain('<a href="#__allAnd">');
    });

    it('correct support of generic type Map<K, V>', () => {
        expect(todoStoreFile).toContain('Map&lt;string, number&gt;');
    });

    it('correct support of abstract and async modifiers', () => {
        expect(todoClassFile).toContain('<span class="modifier">Abstract</span>');
        expect(todoClassFile).toContain('<span class="modifier">Async</span>');
    });

    it('correct support function with empty typed arguments', () => {
        expect(appComponentFile).toContain('<code>openSomeDialog(model,');
    });

    it('correct support unnamed function', () => {
        expect(functionsFile).toContain('Unnamed');
    });

    it('correct display styles tab', () => {
        let file = read(distFolder + '/components/HeaderComponent.html');
        expect(file).toContain('styleData-tab');
        expect(file).toContain('language-scss');
        expect(appComponentFile).toContain('styleData-tab');
        expect(appComponentFile).toContain('font-size');
        file = read(distFolder + '/components/TodoMVCComponent.html');
        expect(file).toContain('styleData-tab');
        expect(file).toContain('pointer-events');
    });

    it('correct support symbol type', () => {
        expect(typeAliasesFile).toContain('string | symbol | Array&lt;string | symbol&gt;');
    });

    it('correct support gorRoot & forChild methods for modules', () => {
        let file = read(distFolder + '/modules/AppModule.html');
        expect(file).toContain('code>forChild(confi');
        expect(file).toContain('code>forRoot(confi');
    });

    it('correct support returned type for miscellaneous function', () => {
        expect(functionsFile).toContain(
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string'
        );
    });

    it('correct http reference for other classes using @link in description of a miscellaneous function', () => {
        expect(functionsFile).toContain(
            '<a href="../components/ListComponent.html">ListComponent</a>'
        );
    });

    it('shorten long arrow function declaration for properties', () => {
        expect(todoClassFile).toContain('() &#x3D;&gt; {...}</code>');
    });

    it('correct supports 1000 as PollingSpeed for decorator arguments', () => {
        let file = read(distFolder + '/classes/SomeFeature.html');
        expect(file).toContain('code>@throttle(1000 as PollingSpeed');
    });

    it('correct supports JSdoc without comment for accessor', () => {
        expect(tidiClassFile).toContain('b>emailAddress</b>');
    });
});
