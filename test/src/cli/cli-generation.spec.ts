import { expect } from "chai";
import {
    temporaryDir,
    shell,
    pkg,
    exists,
    exec,
    read,
    shellAsync,
} from "../helpers";
const path = require("path"),
    tmp = temporaryDir();

describe("CLI simple generation", () => {
    const distFolder = tmp.name + "-simple-generation";

    describe("when generation with d flag - relative folder", () => {
        let stdoutString = undefined,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile,
            emptyModuleFile,
            barModuleFile,
            emptyModuleRawFile,
            exampleTagComponentFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(
                `${distFolder}/components/FooComponent.html`,
            );
            fooServiceFile = read(`${distFolder}/injectables/FooService.html`);
            moduleFile = read(`${distFolder}/modules/AppModule.html`);
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            emptyModuleFile = read(`${distFolder}/modules/EmptyModule.html`);
            emptyModuleRawFile = read(
                `${distFolder}/modules/EmptyRawModule.html`,
            );
            barModuleFile = read(`${distFolder}/modules/BarModule.html`);
            exampleTagComponentFile = read(
                `${distFolder}/components/ExampleTagComponent.html`,
            );
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should display generated message", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });

        it("should have generated main folder", () => {
            const isFolderExists = exists(`${distFolder}`);
            expect(isFolderExists).to.be.true;
        });

        it("should have generated main pages", () => {
            const isIndexExists = exists(`${distFolder}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${distFolder}/modules.html`);
            expect(isModulesExists).to.be.true;
        });

        it("should have generated resources folder", () => {
            const isImagesExists = exists(`${distFolder}/images`);
            expect(isImagesExists).to.be.true;
            const isJSExists = exists(`${distFolder}/js`);
            expect(isJSExists).to.be.true;
            const isStylesExists = exists(`${distFolder}/styles`);
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists(`${distFolder}/fonts`);
            expect(isFontsExists).to.be.true;
        });

        it("should have generated search index json", () => {
            const isIndexExists = exists(
                `${distFolder}/js/search/search_index.js`,
            );
            expect(isIndexExists).to.be.true;
        });

        it("should have generated sourceCode for files", () => {
            expect(moduleFile).to.contain("import { FooDirective } from");
            expect(fooComponentFile).to.contain("export class FooComponent");
            expect(fooServiceFile).to.contain("export class FooService");
        });

        it("should expose Info and API tabs on component pages by default", () => {
            expect(componentFile).to.contain('data-link="info">Info');
            expect(componentFile).to.contain('data-link="api">API');
        });

        it("should render relationships in Info for components and modules", () => {
            expect(componentFile).to.contain("<h3>Relationships</h3>");
            expect(componentFile).to.contain("<h4>Used by</h4>");
            expect(componentFile).to.contain("<h4>Depends on</h4>");

            expect(moduleFile).to.contain("<h3>Relationships</h3>");
            expect(moduleFile).to.contain("<h4>Used by</h4>");
            expect(moduleFile).to.contain("<h4>Depends on</h4>");
        });

        it("should keep API sections in the API tab content", () => {
            expect(componentFile).to.contain('<h3 id="index">Index</h3>');
            expect(componentFile).to.contain('<h3 id="constructor">Constructor</h3>');
            expect(componentFile).to.contain('<h3 id="inputs">Inputs</h3>');
        });

        it("should not render an API tab for module pages without API sections", () => {
            expect(moduleFile).to.not.contain('data-link="api">API');
        });

        /**
         *   JSDOC
         */

        it("it should have a link with this syntax {@link BarComponent}", () => {
            expect(moduleFile).to.contain(
                'See <a href="../components/BarComponent.html">BarComponent',
            );
        });

        it("it should have a link with this syntax [The BarComponent]{@link BarComponent}", () => {
            expect(barModuleFile).to.contain(
                'Watch <a href="../components/BarComponent.html">The BarComponent',
            );
        });

        it("it should have a link with this syntax {@link BarComponent|BarComponent3}", () => {
            expect(fooComponentFile).to.contain(
                'See <a href="../modules/AppModule.html">APP',
            );
        });

        it("it should have infos about FooService open function param", () => {
            expect(fooServiceFile).to.contain("<p>The entry value");
        });

        it("it should have infos about FooService open function returns", () => {
            expect(fooServiceFile).to.contain("<p>The string</p>");
        });

        it("it should have infos about FooService close function return JSDoc tag", () => {
            expect(fooServiceFile).to.contain("<p>Another string</p>");
        });

        it("it should have infos about FooService open function example", () => {
            expect(fooServiceFile).to.contain("<b>Example :</b>");
            expect(fooServiceFile).to.contain("FooService.open(");
        });

        it("it should render class-level @example on a component", () => {
            expect(exampleTagComponentFile).to.contain("<b>Example :</b>");
            expect(exampleTagComponentFile).to.contain("app-example-tag");
        });

        it("it should have link to TypeScript doc", () => {
            expect(fooServiceFile).to.contain("typescriptlang.org");
        });

        it("it should have a link with this syntax {@link http://www.google.fr|Second link}", () => {
            expect(barModuleFile).to.contain(
                '<a href="http://www.google.fr">Second link</a>',
            );
        });
        it("it should have a link with this syntax {@link http://www.google.uk Third link}", () => {
            expect(barModuleFile).to.contain(
                '<a href="http://www.google.uk">Third link</a>',
            );
        });
        it("it should have a link with this syntax [Last link]{@link http://www.google.jp}", () => {
            expect(barModuleFile).to.contain(
                '<a href="http://www.google.jp">Last link</a>',
            );
        });

        /**
         * internal/private methods
         */
        it("should include by default methods marked as internal", () => {
            expect(componentFile).to.contain("<code>internalMethod");
        });

        it("should exclude methods marked as hidden", () => {
            expect(componentFile).not.to.contain("<code>hiddenMethod");
        });

        it("should include by default methods marked as private", () => {
            expect(componentFile).to.contain("<code>privateMethod");
        });

        /**
         * inputs outputs
         */
        it("should generate inputs", () => {
            expect(fooComponentFile).to.contain(`<h3 id="inputs">Inputs</h3>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="aliasedAndRequiredInput"></a>
                        <b>aliasedAndRequiredInput</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Required : </i>&nbsp;<b>true</b>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="52" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:52</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example aliased required input using the object syntax</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="aliasedInput"></a>
                        <b>aliasedInput</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="42" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:42</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example aliased input</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="aliasedInputObjectSyntax"></a>
                        <b>aliasedInputObjectSyntax</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="47" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:47</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example aliased input using the object syntax</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="exampleInput"></a>
                        <b>exampleInput</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Default value : </i><code>&#x27;foo&#x27;</code>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="32" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:32</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example input
<a href="../components/BarComponent.html">BarComponent</a> or <a href="../components/BarComponent.html">BarComponent2</a> or <a href="../components/BarComponent.html">BarComponent3</a></p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="requiredInput"></a>
                        <b>requiredInput</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Required : </i>&nbsp;<b>true</b>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="37" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:37</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example required input</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="aliasedInSignal"></a>
                        <b>aliasedInSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Default value : </i><code>null</code>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="72" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:72</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example aliased input signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="inputSignal"></a>
                        <b>inputSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="../miscellaneous/functions.html#foo" target="_self" >&quot;foo&quot; | &quot;bar&quot;</a></code>

                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Default value : </i><code>&#x27;foo&#x27;</code>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="62" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:62</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example input signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="modelInputSignal"></a>
                        <b>modelInputSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number" target="_blank" >number</a></code>

                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Default value : </i><code>0</code>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="92" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:92</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example model input signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="requiredInputSignal"></a>
                        <b>requiredInputSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Required : </i>&nbsp;<b>true</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Default value : </i><code>&#x27;foo&#x27;</code>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="67" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:67</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example required input signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>`);
        });

        it("should generate outputs", () => {
            expect(fooComponentFile).to.contain(`<h3 id="outputs">Outputs</h3>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="exampleOutput"></a>
                        <b>exampleOutput</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="../miscellaneous/functions.html#foo" target="_self" >EventEmitter&lt;{ foo: string }&gt;</a></code>

                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="57" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:57</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example output</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="aliasedOutSignal"></a>
                        <b>aliasedOutSignal</b>
                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="87" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:87</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example aliased output signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="modelInputSignal"></a>
                        <b>modelInputSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/number" target="_blank" >number</a></code>

                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="92" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:92</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example model input signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="outputSignal"></a>
                        <b>outputSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="../miscellaneous/functions.html#foo" target="_self" >&quot;foo&quot; | &quot;bar&quot;</a></code>

                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="77" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:77</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example output signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table class="table table-sm table-bordered">
            <tbody>
                <tr>
                    <td class="col-md-4">
                        <a name="requiredOutputSignal"></a>
                        <b>requiredOutputSignal</b>
                    </td>
                </tr>
                <tr>
                    <td class="col-md-4">
                        <i>Type : </i>        <code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string" target="_blank" >string</a></code>

                    </td>
                </tr>
                        <tr>
                            <td class="col-md-2" colspan="2">
                                    <div class="io-line">Defined in <a href="" data-line="82" class="link-to-prism">test/fixtures/sample-files/foo.component.ts:82</a></div>
                            </td>
                        </tr>
                <tr>
                    <td class="col-md-4">
                        <div class="io-description"><p>An example required output signal</p>
</div>
                    </td>
                </tr>
            </tbody>
        </table>`);
        });

        /**
         * No graph for empty module
         */

        it("it should not generate graph for empty metadatas module", () => {
            expect(emptyModuleFile).not.to.contain("module-graph-svg");
        });

        it("it should not break for empty raw metadatas module", () => {
            expect(emptyModuleRawFile).not.to.contain("module-graph-svg");
        });

        /**
         * Support of function type parameters
         */

        it("it should display function type parameters", () => {
            expect(fooServiceFile).to.contain("<code>close(work: (toto: ");
        });

        it("it should display c-style typed arrays", () => {
            expect(fooServiceFile).to.contain("<code>string");
        });

        /**
         * WC Menu
         */
        it("should have generated wc menu", () => {
            const isWCFile = exists(`${distFolder}/js/menu-wc.js`);
            expect(isWCFile).to.be.true;
        });
    });

    describe("when generation with d flag without / at the end - relative folder", () => {
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should have generated main folder", () => {
            const isFolderExists = exists(`${distFolder}`);
            expect(isFolderExists).to.be.true;
        });

        it("should have generated main pages", () => {
            const isIndexExists = exists(`${distFolder}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${distFolder}/modules.html`);
            expect(isModulesExists).to.be.true;
        });
    });

    describe("when generation with d flag - absolute folder", () => {
        let stdoutString = undefined,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell(
                "node",
                [
                    "../bin/index-cli.js",
                    "-p",
                    "../test/fixtures/sample-files/tsconfig.simple.json",
                    "-d",
                    "/tmp/" + distFolder + "/",
                ],
                { cwd: distFolder },
            );

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(
                `/tmp/${distFolder}/components/FooComponent.html`,
            );
            fooServiceFile = read(
                `/tmp/${distFolder}/injectables/FooService.html`,
            );
            moduleFile = read(`/tmp/${distFolder}/modules/AppModule.html`);
            componentFile = read(
                `/tmp/${distFolder}/components/BarComponent.html`,
            );
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should display generated message", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });

        it("should have generated main folder", () => {
            const isFolderExists = exists(`/tmp/${distFolder}`);
            expect(isFolderExists).to.be.true;
        });

        it("should have generated main pages", () => {
            const isIndexExists = exists(`/tmp/${distFolder}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`/tmp/${distFolder}/modules.html`);
            expect(isModulesExists).to.be.true;
        });

        it("should have generated resources folder", () => {
            const isImagesExists = exists(`/tmp/${distFolder}/images`);
            expect(isImagesExists).to.be.true;
            const isJSExists = exists(`/tmp/${distFolder}/js`);
            expect(isJSExists).to.be.true;
            const isStylesExists = exists(`/tmp/${distFolder}/styles`);
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists(`/tmp/${distFolder}/fonts`);
            expect(isFontsExists).to.be.true;
        });

        it("should have generated search index json", () => {
            const isIndexExists = exists(
                `/tmp/${distFolder}/js/search/search_index.js`,
            );
            expect(isIndexExists).to.be.true;
        });
    });

    /*describe('when generation with d flag - absolute folder inside cwd', () => {

        let stdoutString = undefined,
            actualDir,
            fooComponentFile,
            fooServiceFile,
            componentFile,
            moduleFile;
        before((done) => {
            tmp.create(distFolder);

            actualDir = process.cwd();

            actualDir = actualDir.replace(' ', '');
            actualDir = actualDir.replace('\n', '');
            actualDir = actualDir.replace('\r\n', '');

            let ls = shell('node', [
                './bin/index-cli.js',
                '-p', './test/fixtures/sample-files/tsconfig.simple.json',
                '-d', actualDir + '/' + distFolder], { cwd: distFolder});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            fooComponentFile = read(`/tmp/${distFolder}/components/FooComponent.html`);
            fooServiceFile = read(`/tmp/${distFolder}/injectables/FooService.html`);
            moduleFile  = read(`/tmp/${distFolder}/modules/AppModule.html`);
            componentFile = read(`/tmp/${distFolder}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean(actualDir + '/' + distFolder));

        it('should display generated message', () => {
            expect(stdoutString).to.contain('Documentation generated');
        });

        it('should have generated main folder', () => {
            const isFolderExists = exists(`${actualDir}/${distFolder}`);
            expect(isFolderExists).to.be.true;
        });

        it('should have generated main pages', () => {
            const isIndexExists = exists(`${actualDir}/${distFolder}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${actualDir}/${distFolder}/modules.html`);
            expect(isModulesExists).to.be.true;
        });

        it('should have generated resources folder', () => {
            const isImagesExists = exists(`${actualDir}/${distFolder}/images`);
            expect(isImagesExists).to.be.true;
            const isJSExists = exists(`${actualDir}/${distFolder}/js`);
            expect(isJSExists).to.be.true;
            const isStylesExists = exists(`${actualDir}/${distFolder}/styles`);
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists(`${actualDir}/${distFolder}/fonts`);
            expect(isFontsExists).to.be.true;
        });

        it('should have generated search index json', () => {
            const isIndexExists = exists(`${actualDir}/${distFolder}/js/search/search_index.js`);
            expect(isIndexExists).to.be.true;
        });
    });*/

    describe("when generation with d and a flags", () => {
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
                "-a",
                "./screenshots/",
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should have copying assets folder", () => {
            const isFolderExists = exists(`${distFolder}/screenshots`);
            expect(isFolderExists).to.be.true;
        });
    });

    describe("when passing a deep path on a flag", () => {
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
                "-a",
                "./test/fixtures/todomvc-ng2/screenshots/actions",
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should flatten the path to the deeper dirname", () => {
            const isFolderExists = exists(`${distFolder}/actions`);
            expect(isFolderExists).to.be.true;
        });
    });

    describe("when generation with d flag and src arg", () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "./test/fixtures/sample-files/",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should display generated message", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });

        it("should have generated main folder", () => {
            const isFolderExists = exists(`${distFolder}`);
            expect(isFolderExists).to.be.true;
        });

        it("should have generated main pages", () => {
            const isIndexExists = exists(`${distFolder}/index.html`);
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists(`${distFolder}/modules.html`);
            expect(isModulesExists).to.be.true;
        });
    });

    describe("when generation without d flag", () => {
        let stdoutString = undefined;
        before(function (done) {
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean("documentation"));

        it("should display generated message", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });

        it("should have generated main folder", () => {
            const isFolderExists = exists("documentation");
            expect(isFolderExists).to.be.true;
        });

        it("should have generated main pages", () => {
            const isIndexExists = exists("documentation/index.html");
            expect(isIndexExists).to.be.true;
            const isModulesExists = exists("documentation/modules.html");
            expect(isModulesExists).to.be.true;
        });

        it("should have generated resources folder", () => {
            const isImagesExists = exists("documentation/images");
            expect(isImagesExists).to.be.true;
            const isJSExists = exists("documentation/js");
            expect(isJSExists).to.be.true;
            const isStylesExists = exists("documentation/styles");
            expect(isStylesExists).to.be.true;
            const isFontsExists = exists("documentation/fonts");
            expect(isFontsExists).to.be.true;
        });
    });

    describe("when generation with -t flag", () => {
        let stdoutString = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-t",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not display anything", () => {
            expect(stdoutString).to.not.contain("parsing");
        });
    });

    describe("when generation with --theme flag", () => {
        let stdoutString = undefined,
            baseTheme = "laravel",
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--theme",
                baseTheme,
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should add theme css", () => {
            index = read(`${distFolder}/index.html`);
            expect(index).to.contain('href="./styles/' + baseTheme + '.css"');
        });
    });

    describe("when generation with -n flag", () => {
        let stdoutString = undefined,
            name = "TodoMVC-angular2-application",
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-n",
                name,
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should edit name", () => {
            index = read(`${distFolder}/js/menu-wc.js`);
            expect(index).to.contain(name);
        });
    });

    describe("when generation with --hideGenerator flag", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--hideGenerator",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain compodoc logo", () => {
            index = read(`${distFolder}/index.html`);
            expect(index).to.not.contain(
                'src="./images/compodoc-vectorise.svg"',
            );
        });
    });

    describe("when generation with --hideDarkModeToggle flag", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--hideDarkModeToggle",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain dark mode toggle", () => {
            index = read(`${distFolder}/index.html`);
            expect(index).to.not.contain('class="dark-mode-switch"');
        });
    });

    describe("when generation with --disableSourceCode flag", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--disableSourceCode",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain sourceCode tab", () => {
            index = read(`${distFolder}/modules/AppModule.html`);
            expect(index).to.not.contain('id="source-tab"');
        });
    });

    describe("when generation with --disableDomTree flag", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--disableDomTree",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain domTree tab", () => {
            index = read(`${distFolder}/components/BarComponent.html`);
            expect(index).to.not.contain('id="tree-tab"');
        });
    });

    describe("when generation of component dependency doc with --navTabConfig option", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--navTabConfig",
                `[
                    {\"id\": \"source\",\"label\": \"Test Label 1\"},
                    {\"id\": \"info\",\"label\": \"Test Label 2\"}
                ]`,
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            index = read(`${distFolder}/components/BarComponent.html`);
            index = index.replace(/\r?\n|\r/g, "");
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain a domTree tab", () => {
            expect(index).to.not.contain('id="tree-tab"');
        });
        it("should not contain a template tab", () => {
            expect(index).to.not.contain('id="templateData-tab"');
        });
        it("should set source as the active tab", () => {
            expect(index).to.contain(
                '<a href="#source" class="nav-link active"',
            );
        });
        it("should set the source tab label", () => {
            expect(index).to.contain('data-link="source">Test Label 1');
        });
        it("should set the info tab label", () => {
            expect(index).to.contain('data-link="info">Test Label 2');
        });
        it("should not contain the API tab when omitted from navTabConfig", () => {
            expect(index).to.not.contain('data-link="api">');
        });
    });

    describe("when generation of component dependency doc with --navTabConfig option including API", () => {
        let index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--navTabConfig",
                `[
                    {\"id\": \"source\",\"label\": \"Source\"},
                    {\"id\": \"info\",\"label\": \"Info\"},
                    {\"id\": \"api\",\"label\": \"API Surface\"}
                ]`,
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            index = read(`${distFolder}/components/BarComponent.html`);
            index = index.replace(/\r?\n|\r/g, "");
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should set the API tab label", () => {
            expect(index).to.contain('data-link="api">API Surface');
        });
    });

    describe("when generation of module dependency doc with --navTabConfig option", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--navTabConfig",
                `[
                    {\"id\": \"tree\",\"label\": \"DOM Tree\"},
                    {\"id\": \"source\",\"label\": \"Source\"},
                    {\"id\": \"info\",\"label\": \"Info\"}
                ]`,
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            index = read(`${distFolder}/modules/AppModule.html`);
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain a domTree tab", () => {
            expect(index).to.not.contain('id="tree-tab"');
        });
    });

    describe("when generation with --disableTemplateTab flag", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--disableTemplateTab",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain template tab", () => {
            index = read(`${distFolder}/components/BarComponent.html`);
            expect(index).to.not.contain('id="templateData-tab"');
        });
    });

    describe("when generation with --disableStyleTab flag", () => {
        let stdoutString = undefined,
            index = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--disableStyleTab",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain style tab", () => {
            index = read(`${distFolder}/components/BarComponent.html`);
            expect(index).to.not.contain('id="styleData-tab"');
        });
    });

    describe("when generation with --disableGraph flag", () => {
        let stdoutString = undefined,
            fileContents = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--disableGraph",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not generate any graph data", () => {
            expect(stdoutString).to.contain("Graph generation disabled");
            expect(stdoutString).not.to.contain("Process main graph");
        });

        it("should not include the graph on the modules page", () => {
            fileContents = read(`${distFolder}/modules.html`);
            expect(fileContents).to.not.contain("dependencies.svg");
            expect(fileContents).to.not.contain("svg-pan-zoom");
        });

        it("should not include the graph on the overview page", () => {
            fileContents = read(`${distFolder}/index.html`);
            expect(fileContents).to.not.contain("graph/dependencies.svg");
            expect(fileContents).to.not.contain("svg-pan-zoom");
        });

        it("should not include the graph on the individual modules pages", () => {
            fileContents = read(`${distFolder}/modules/AppModule.html`);
            expect(fileContents).to.not.contain(
                "modules/AppModule/dependencies.svg",
            );
            expect(fileContents).to.not.contain("svg-pan-zoom");
        });
    });

    describe("when generation with --disableFilePath flag", () => {
        let stdoutString = undefined,
            componentFile = undefined,
            moduleFile = undefined,
            directiveFile = undefined,
            pipeFile = undefined,
            serviceFile = undefined;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "--disableFilePath",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should not contain file path in component documentation", () => {
            componentFile = read(`${distFolder}/components/BarComponent.html`);
            expect(componentFile).to.not.contain("<h3>File</h3>");
            expect(componentFile).to.not.contain(
                "<code>bar.component.ts</code>",
            );
        });

        it("should not contain file path in module documentation", () => {
            moduleFile = read(`${distFolder}/modules/AppModule.html`);
            expect(moduleFile).to.not.contain("<h3>File</h3>");
            expect(moduleFile).to.not.contain("<code>app.module.ts</code>");
        });

        it("should not contain file path in directive documentation", () => {
            directiveFile = read(`${distFolder}/directives/BarDirective.html`);
            expect(directiveFile).to.not.contain("<h3>File</h3>");
            expect(directiveFile).to.not.contain(
                "<code>bar.directive.ts</code>",
            );
        });

        it("should not contain file path in pipe documentation", () => {
            pipeFile = read(`${distFolder}/pipes/BarPipe.html`);
            expect(pipeFile).to.not.contain("<h3>File</h3>");
            expect(pipeFile).to.not.contain("<code>bar.pipe.ts</code>");
        });

        it("should not contain file path in service documentation", () => {
            serviceFile = read(`${distFolder}/injectables/BarService.html`);
            expect(serviceFile).to.not.contain("<h3>File</h3>");
            expect(serviceFile).to.not.contain("<code>bar.service.ts</code>");
        });
    });

    describe("when generation with -r flag", () => {
        let stdoutString = "",
            port = 6666,
            child;
        before(function (done) {
            tmp.create(distFolder);
            let ls = shell(
                "node",
                [
                    "./bin/index-cli.js",
                    "-s",
                    "-r",
                    "-r",
                    port,
                    "-d",
                    distFolder,
                ],
                { timeout: 10000 },
            );

            if (ls.stderr.toString() !== "") {
                done(new Error(`shell error: ${ls.stderr.toString()}`));
                return;
            }

            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should contain port " + port, () => {
            expect(stdoutString).to.contain("Serving documentation");
            expect(stdoutString).to.contain(port);
        });
    });

    describe("when generation with -p flag - absolute folder", () => {
        let stdoutString = "";
        before(function (done) {
            tmp.create(distFolder);

            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                path.join(
                    process.cwd() +
                        path.sep +
                        "test/fixtures/todomvc-ng2/src/tsconfig.json",
                ),
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                done(new Error(`shell error: ${ls.stderr.toString()}`));
                return;
            }

            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should display generated message", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });
    });

    describe("router parser coverage tests", () => {
        const distFolder = tmp.name + "-router-parser-coverage";
        let stdoutString = undefined;

        before(function (done) {
            tmp.create(distFolder);
            let ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/router-parser-coverage/tsconfig.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should process router parser test fixture without errors", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });

        it("should process identifiers in route arrays (cleanFileIdentifiers)", () => {
            expect(stdoutString).to.contain(
                "found          : DYNAMIC_ROUTE_ID",
            );
            expect(stdoutString).to.contain(
                "found          : FALLBACK_COMPONENT",
            );
        });

        it("should analyze routes definitions for spread elements (cleanFileSpreads)", () => {
            expect(stdoutString).to.contain(
                "Analysing routes definitions and clean them if necessary",
            );
        });

        it("should process property access expressions and call expressions", () => {
            expect(stdoutString).to.contain("found          : RouterUtils");
            expect(stdoutString).to.contain("found          : RoutePaths");
        });

        it("should generate documentation for routing module", () => {
            expect(stdoutString).to.contain(
                "found          : AppRoutingModule",
            );
        });
    });

    describe("spread of computed array (routes via .map()) should not crash", () => {
        const distFolder = tmp.name + "-router-spread-map";
        let stdoutString = undefined;
        let stderrString = undefined;

        before(function (done) {
            tmp.create(distFolder);
            const ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/router-spread-map/tsconfig.json",
                "-d",
                distFolder,
            ]);

            stderrString = ls.stderr.toString();
            stdoutString = ls.stdout.toString();
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should complete without an unhandled rejection", () => {
            expect(stderrString).to.not.contain("Unhandled Rejection");
            expect(stderrString).to.not.contain("InvalidOperationError");
        });

        it("should generate documentation successfully", () => {
            expect(stdoutString).to.contain("Documentation generated");
        });

        it("should emit a warning for the non-inlineable spread instead of throwing", () => {
            expect(stdoutString).to.contain("allPartRoutes");
        });
    });

    describe("singular styleUrl is included in the component styleUrls list", () => {
        const distFolder = tmp.name + "-style-url-singular";
        let componentFile;

        before(function (done) {
            tmp.create(distFolder);
            const ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            componentFile = read(
                `${distFolder}/components/StyleUrlSingularComponent.html`,
            );
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should generate a page for the component", () => {
            expect(componentFile).to.contain("StyleUrlSingularComponent");
        });

        it("should list the singular styleUrl in the styleUrls metadata row", () => {
            expect(componentFile).to.contain("bar.style.scss");
        });

        it("should render the styleUrls metadata row, not a separate styleUrl row", () => {
            expect(componentFile).to.contain(">styleUrls<");
        });
    });

    describe("providers via identifier reference are resolved in NgModule", () => {
        const distFolder = tmp.name + "-providers-identifier-ref";
        let moduleFile;

        before(function (done) {
            tmp.create(distFolder);
            const ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            moduleFile = read(
                `${distFolder}/modules/ProvidersIdentifierRefModule.html`,
            );
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should generate a page for the module", () => {
            expect(moduleFile).to.contain("ProvidersIdentifierRefModule");
        });

        it("should list the provider from the referenced const array", () => {
            expect(moduleFile).to.contain("ProvidersIdentifierRefService");
        });
    });

    describe("styleUrls as local const variable reference are resolved in component", () => {
        const distFolder = tmp.name + "-style-urls-variable";
        let componentFile;

        before(function (done) {
            tmp.create(distFolder);
            const ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            componentFile = read(
                `${distFolder}/components/StyleUrlsVariableComponent.html`,
            );
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should generate a page for the component", () => {
            expect(componentFile).to.contain("StyleUrlsVariableComponent");
        });

        it("should list styleUrls resolved from the local const variable", () => {
            expect(componentFile).to.contain("bar.style.scss");
        });

        it("should not list the variable name as a styleUrl in the metadata row", () => {
            // The styleUrls metadata cell should contain the resolved filename, not the variable name
            expect(componentFile).not.to.match(
                /<td class="col-md-3">styleUrls<\/td>[\s\S]*?COMPONENT_STYLE_URLS[\s\S]*?<\/td>/,
            );
        });
    });

    describe("styleUrls as imported const variable reference are resolved in component", () => {
        const distFolder = tmp.name + "-style-urls-variable-imported";
        let componentFile;

        before(function (done) {
            tmp.create(distFolder);
            const ls = shell("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-d",
                distFolder,
            ]);

            if (ls.stderr.toString() !== "") {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done("error");
            }
            componentFile = read(
                `${distFolder}/components/StyleUrlsVariableImportedComponent.html`,
            );
            done();
        });
        after(() => tmp.clean(distFolder));

        it("should generate a page for the component", () => {
            expect(componentFile).to.contain(
                "StyleUrlsVariableImportedComponent",
            );
        });

        it("should list styleUrls resolved from the imported const variable", () => {
            expect(componentFile).to.contain("bar.style.scss");
        });

        it("should not list the variable name as a styleUrl in the metadata row", () => {
            // The styleUrls metadata cell should contain the resolved filename, not the variable name
            expect(componentFile).not.to.match(
                /<td class="col-md-3">styleUrls<\/td>[\s\S]*?COMPONENT_STYLE_URLS_IMPORTED[\s\S]*?<\/td>/,
            );
        });
    });
});
