<a name="1.0.0-beta.13"></a>
# [1.0.0-beta.13](https://github.com/compodoc/compodoc/compare/1.0.0-beta.12...1.0.0-beta.13) (2017-07-15)

### Bug Fixes

* **deps:** Resolve array declaration in modules ([619842d](https://github.com/compodoc/compodoc/commit/619842d)), closes [#210](https://github.com/compodoc/compodoc/issues/210) [#15](https://github.com/compodoc/compodoc/issues/15)
* **routes:** Routes names required to be unique ([7f17ecb](https://github.com/compodoc/compodoc/commit/7f17ecb)), closes [#193](https://github.com/compodoc/compodoc/issues/193)
* **deps:** RangeError: Invalid array length / @input/@output parsing ([048fd20](https://github.com/compodoc/compodoc/commit/048fd20)), closes [#209](https://github.com/compodoc/compodoc/issues/209)
* **html:** Type in "Infos" tab - should be "Info" ([1ceee52](https://github.com/compodoc/compodoc/commit/1ceee52)), closes [#224](https://github.com/compodoc/compodoc/issues/224)
* **html:** Source code not rendered ([bfe4708](https://github.com/compodoc/compodoc/commit/bfe4708)), closes [#223](https://github.com/compodoc/compodoc/issues/223)

### Features

* **chore:** Add an interactive examples tab ([34de4f0](https://github.com/compodoc/compodoc/commit/34de4f0)), closes [#188](https://github.com/compodoc/compodoc/issues/188) Thanks rprotsyk.
* **doc:** support to display the changelog.md, contributing, license, todo ([272a0ad](https://github.com/compodoc/compodoc/commit/272a0ad)), closes [#215](https://github.com/compodoc/compodoc/issues/215)
* **watch:** Watch README.md, and other root markdown files ([ed05424](https://github.com/compodoc/compodoc/commit/ed05424)), closes [#221](https://github.com/compodoc/compodoc/issues/221)
* **chore:** Markdown file support for modules, services, etc ([918a521](https://github.com/compodoc/compodoc/commit/918a521)), closes [#204](https://github.com/compodoc/compodoc/issues/204)

<a name="1.0.0-beta.12"></a>
# [1.0.0-beta.12](https://github.com/compodoc/compodoc/compare/1.0.0-beta.11...1.0.0-beta.12) (2017-07-09)

### Bug Fixes

* **chore:** Cannot find module 'json5' ([04fb75f](https://github.com/compodoc/compodoc/commit/04fb75f)), closes [#219](https://github.com/compodoc/compodoc/issues/219)
* **dependencies:** All types display in the doc as void (incorrect types) ([c586b32](https://github.com/compodoc/compodoc/commit/c586b32)), closes [#218](https://github.com/compodoc/compodoc/issues/218)

<a name="1.0.0-beta.11"></a>
# [1.0.0-beta.11](https://github.com/compodoc/compodoc/compare/1.0.0-beta.10...1.0.0-beta.11) (2017-07-08)

### Bug Fixes

* **options:** Link correct options with CLI flags ([82af585](https://github.com/compodoc/compodoc/commit/82af585)), closes [#205](https://github.com/compodoc/compodoc/issues/205)
* **watch:** Watch mode not working properly ([4264b5e](https://github.com/compodoc/compodoc/commit/4264b5e)), closes [#141](https://github.com/compodoc/compodoc/issues/141)
* **search-engine:** Invalid JSON is creating an issue when rendering the object to the template ([8042af5](https://github.com/compodoc/compodoc/commit/8042af5)), closes [#187](https://github.com/compodoc/compodoc/issues/187)
* **routes:** Trailing commas throw error when parsing routes ([7bc1e05](https://github.com/compodoc/compodoc/commit/7bc1e05)), closes [#192](https://github.com/compodoc/compodoc/issues/192) [#173](https://github.com/compodoc/compodoc/issues/173)
* **misc:** Miscellaneous sections Functions not showing documentation ([235f1d0](https://github.com/compodoc/compodoc/commit/235f1d0)), closes [#142](https://github.com/compodoc/compodoc/issues/142)
* **deps:** add @default support ([78257cc](https://github.com/compodoc/compodoc/commit/78257cc)), closes [#212](https://github.com/compodoc/compodoc/issues/212)
* **deps:** Bespoke types and Promise being converted to any type in output documentation ([35af038](https://github.com/compodoc/compodoc/commit/35af038)), closes [#208](https://github.com/compodoc/compodoc/issues/208)
* **output:** Linux unix like environments: Absolute paths generates fonts, images, js and styles in the wrong directory ([e0a3c60](https://github.com/compodoc/compodoc/commit/e0a3c60)), closes [#206](https://github.com/compodoc/compodoc/issues/206)

### Features

* **log:** add more logs on silent mode ([1c858c7](https://github.com/compodoc/compodoc/commit/1c858c7))
* **chore:** run files generation in // +20% in speed generation :tada: ([832b20d](https://github.com/compodoc/compodoc/commit/832b20d))

<a name="1.0.0-beta.10"></a>
# [1.0.0-beta.10](https://github.com/compodoc/compodoc/compare/1.0.0-beta.9...1.0.0-beta.10) (2017-06-19)

### Bug Fixes

* **menu:** Make the entire list item clickable for a section toggle ([4f4c1f5](https://github.com/compodoc/compodoc/commit/4f4c1f5)), closes [#194](https://github.com/compodoc/compodoc/issues/194)
* **chore:** kind icon issue for properties and functions ([4b9f496](https://github.com/compodoc/compodoc/commit/4b9f496))
* **menu:** Navigation: clicking on a sub element (page) inside the expandable category expands all categories ([86ac1b4](https://github.com/compodoc/compodoc/commit/86ac1b4)), closes [#186](https://github.com/compodoc/compodoc/issues/186)
* **markdown:** At sign replaced by a brace in markdown code blocks ([41c6b0d](https://github.com/compodoc/compodoc/commit/41c6b0d)), closes [#189](https://github.com/compodoc/compodoc/issues/189)
* **dependencies:** Multiple classes in the same file get the same description ([8a679f0](https://github.com/compodoc/compodoc/commit/8a679f0)), closes [#118](https://github.com/compodoc/compodoc/issues/118)
* **exclude:** Not able to exclude files from documentation ([a88023c](https://github.com/compodoc/compodoc/commit/a88023c)), closes [#175](https://github.com/compodoc/compodoc/issues/175)
* **source:** Hide some elements if source code is disabled ([0e81c15](https://github.com/compodoc/compodoc/commit/0e81c15)), closes [#185](https://github.com/compodoc/compodoc/issues/185)
* **badge:** Documentation coverage badge size should match common badges ([21f5abe](https://github.com/compodoc/compodoc/commit/21f5abe)), closes [#200](https://github.com/compodoc/compodoc/issues/200)
* **dependencies:** Interface generation missing w/o errors. ([2b7d4e7](https://github.com/compodoc/compodoc/commit/2b7d4e7)), closes [#198](https://github.com/compodoc/compodoc/issues/198)
* **dependencies:** Please Support @private JSDoc. ([6c7ce67](https://github.com/compodoc/compodoc/commit/6c7ce67)), closes [#183](https://github.com/compodoc/compodoc/issues/183)
* **comments:** Newline markdown ([74f64d2](https://github.com/compodoc/compodoc/commit/74f64d2)), closes [#195](https://github.com/compodoc/compodoc/issues/195)

### Features

* **version** Detect angular version and link to the correct version of the documentation ([f270af7](https://github.com/compodoc/compodoc/commit/f270af7)), closes [#180](https://github.com/compodoc/compodoc/issues/180)
* **dependencies:** Parsing refactoring, huge speed boost +75% ! ([65744ed](https://github.com/compodoc/compodoc/commit/65744ed))

<a name="1.0.0-beta.9"></a>
# [1.0.0-beta.9](https://github.com/compodoc/compodoc/compare/1.0.0-beta.8...1.0.0-beta.9) (2017-05-11)

### Bug Fixes

* **markdown:** Fix escaping of html entities in code blocks ([e816cbe](https://github.com/compodoc/compodoc/commit/e816cbe)), thanks Thomas Mair
* **config:** Allow for comments in tsconfig.json ([2796de5](https://github.com/compodoc/compodoc/commit/2796de5)), closes [#177](https://github.com/compodoc/compodoc/issues/177)
* **chore:** Problem with resources file when providing absolute output path ([b52a40e7](https://github.com/compodoc/compodoc/commit/b52a40e7)), closes [#176](https://github.com/compodoc/compodoc/issues/176)
* **watch:** Watch for additional doc too ([52801f4b](https://github.com/compodoc/compodoc/commit/52801f4b)), closes [#163](https://github.com/compodoc/compodoc/issues/163)
* **dependencies:** decorators support ([65bbabc7](https://github.com/compodoc/compodoc/commit/65bbabc7)), closes [#171](https://github.com/compodoc/compodoc/issues/171)
* **markdown:** Set marked break option to false ([0e6ac342](https://github.com/compodoc/compodoc/commit/0e6ac342)), closes [#181](https://github.com/compodoc/compodoc/issues/181)
* **dependencies:** UTF8 Bom support ([a3d5bec7](https://github.com/compodoc/compodoc/commit/a3d5bec7)), closes [#170](https://github.com/compodoc/compodoc/issues/170)

### Features

* **app** exclude with glob patterns ([6310735](https://github.com/compodoc/compodoc/commit/6310735)), closes [#174](https://github.com/compodoc/compodoc/issues/174)
* **cli** display Node.js and OS infos after banner ([c0f60561](https://github.com/compodoc/compodoc/commit/c0f60561))

<a name="1.0.0-beta.8"></a>
# [1.0.0-beta.8](https://github.com/compodoc/compodoc/compare/1.0.0-beta.7...1.0.0-beta.8) (2017-04-26)

### Bug Fixes

* **dependencies:** custom decorators breaks ([50578ec](https://github.com/compodoc/compodoc/commit/50578ec)), closes [#169](https://github.com/compodoc/compodoc/issues/169)
* **UI:** Open menu when item selected ([70d38c7](https://github.com/compodoc/compodoc/commit/70d38c7)), closes [#168](https://github.com/compodoc/compodoc/issues/168)
* **graph:** No Declarations or Providers being added to module graphs ([bf776f4](https://github.com/compodoc/compodoc/commit/bf776f4)), closes [#167](https://github.com/compodoc/compodoc/issues/167)

### Features

* **files:** Better error reporting for template file reading ([6f2d783](https://github.com/compodoc/compodoc/commit/6f2d783))

<a name="1.0.0-beta.7"></a>
# [1.0.0-beta.7](https://github.com/compodoc/compodoc/compare/1.0.0-beta.6...1.0.0-beta.7) (2017-04-25)

### Bug Fixes

* **overview:** Main overview graph is shifted on right side ([8fe238d](https://github.com/compodoc/compodoc/commit/8fe238d)), closes [#166](https://github.com/compodoc/compodoc/issues/166)

<a name="1.0.0-beta.6"></a>
# [1.0.0-beta.6](https://github.com/compodoc/compodoc/compare/1.0.0-beta.5...1.0.0-beta.6) (2017-04-25)

### Bug Fixes

* **dependencies:** Unhandled promise rejection with "use strict" ([f56c01a](https://github.com/compodoc/compodoc/commit/f56c01a)), closes [#165](https://github.com/compodoc/compodoc/issues/165)
* **links:** Interface Linking is wrong ([152c722](https://github.com/compodoc/compodoc/commit/152c722)), closes [#157](https://github.com/compodoc/compodoc/issues/157)

### Features

* **component:** Expand on the Readme.md for component to use component.md (actual name of component) ([c246ffb](https://github.com/compodoc/compodoc/commit/c246ffb)), closes [#164](https://github.com/compodoc/compodoc/issues/164)
* **coverage:** Coverage test command ([e15f238](https://github.com/compodoc/compodoc/commit/e15f238)), closes [#156](https://github.com/compodoc/compodoc/issues/156)

<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/compodoc/compodoc/compare/1.0.0-beta.4...1.0.0-beta.5) (2017-04-22)

### Bug Fixes

* **modules:** module graph controls JS error with file:// ([6d4be23](https://github.com/compodoc/compodoc/commit/6d4be23)), closes [#153](https://github.com/compodoc/compodoc/issues/153) [#159](https://github.com/compodoc/compodoc/issues/159)
* **component:** custom treatment of the metadata field `template` ([1bbda74](https://github.com/compodoc/compodoc/commit/1bbda74)), closes [#137](https://github.com/compodoc/compodoc/issues/137)
* **component:** loading template from another component fails ([1bbda74](https://github.com/compodoc/compodoc/commit/1bbda74)), closes [#147](https://github.com/compodoc/compodoc/issues/147)

<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/compodoc/compodoc/compare/1.0.0-beta.3...1.0.0-beta.4) (2017-04-20)

### Bug Fixes

* **directives:** "Implements" support for directives. ([6138070](https://github.com/compodoc/compodoc/commit/6138070)), closes [#155](https://github.com/compodoc/compodoc/issues/155)
* **links:** Link to "Getting started" / "README" should be ./index.html ([8d30fd9](https://github.com/compodoc/compodoc/commit/8d30fd9)), closes [#158](https://github.com/compodoc/compodoc/issues/158)
* **dependencies:** Main modules graph seems too confuse ([ef7b04f](https://github.com/compodoc/compodoc/commit/ef7b04f)), closes [#150](https://github.com/compodoc/compodoc/issues/150)

### Features

* **app:** Link directly to the README of a component ([3636ce3](https://github.com/compodoc/compodoc/commit/3636ce3)), closes [#154](https://github.com/compodoc/compodoc/issues/154)


<a name="1.0.0-beta.3"></a>
# [1.0.0-beta.3](https://github.com/compodoc/compodoc/compare/1.0.0-beta.2...1.0.0-beta.3) (2017-04-05)

### Bug Fixes

* **coverage:** Documentation coverage issue. ([a01ee06](https://github.com/compodoc/compodoc/commit/a01ee06)), closes [#143](https://github.com/compodoc/compodoc/issues/148)
* **search:** Search links are broken. ([e81a0f7](https://github.com/compodoc/compodoc/commit/e81a0f7)), closes [#140](https://github.com/compodoc/compodoc/issues/146)

<a name="1.0.0-beta.2"></a>
# [1.0.0-beta.2](https://github.com/compodoc/compodoc/compare/1.0.0-beta.1...1.0.0-beta.2) (2017-04-04)

### Bug Fixes

* **dom-tree:** Unable to view DOMTree nodes image correctly. ([2b5f275](https://github.com/compodoc/compodoc/commit/2b5f275)), closes [#143](https://github.com/compodoc/compodoc/issues/143)
* **app:** Links are broken for static doc. ([da2e18e](https://github.com/compodoc/compodoc/commit/da2e18e)), closes [#140](https://github.com/compodoc/compodoc/issues/140)

### Features

* **app:** toggleMenuItems for additionalPages ([692cfa0](https://github.com/compodoc/compodoc/commit/692cfa0))

<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/compodoc/compodoc/compare/0.0.41...1.0.0-beta.1) (2017-04-03)

### Breaking changes

* @compodoc/compodoc : move compodoc to @compodoc/compodoc

### Features

* **app:** add component DOM tree graph in tab ([318d0c6](https://github.com/compodoc/compodoc/commit/318d0c6)), closes [#108](https://github.com/compodoc/compodoc/issues/108)
* **app:** add outlet routes detail, cleaning ([a859976](https://github.com/compodoc/compodoc/commit/a859976))
* **app:** additional documentation support ([8792b3a](https://github.com/compodoc/compodoc/commit/8792b3a))
* **app:** component DOM tree clickable and link to known components ([ea5df1e](https://github.com/compodoc/compodoc/commit/ea5df1e))
* **app:** details on unique names for routes ([6d0df01](https://github.com/compodoc/compodoc/commit/6d0df01))
* **app:** display lazy-loaded modules infos / WIP ([5bc21dc](https://github.com/compodoc/compodoc/commit/5bc21dc))
* **app:** link component DOM tree with directives founded ([3a8010a](https://github.com/compodoc/compodoc/commit/3a8010a))
* **app:** misc type first support ([1db6781](https://github.com/compodoc/compodoc/commit/1db6781))
* **app:** move to prism.js for syntax highlighting + "Defined in" link ([c252d6e](https://github.com/compodoc/compodoc/commit/c252d6e))
* **app:** new routes page ([169730a](https://github.com/compodoc/compodoc/commit/169730a)), closes [#39](https://github.com/compodoc/compodoc/issues/39) [#17](https://github.com/compodoc/compodoc/issues/17)
* **app:** routes guards ([aa27e65](https://github.com/compodoc/compodoc/commit/aa27e65))
* **app:** routes page with modules support ([1a6a390](https://github.com/compodoc/compodoc/commit/1a6a390))
* **app:** templateUrl file read ([53ceeb8](https://github.com/compodoc/compodoc/commit/53ceeb8))
* **app:** toggleMenuItems option ([52891da](https://github.com/compodoc/compodoc/commit/52891da))
* **app:** watch flag ([dbe7cb6](https://github.com/compodoc/compodoc/commit/dbe7cb6)), closes [#20](https://github.com/compodoc/compodoc/issues/20)
* **app:** watch flag | add/remove support ([a276dac](https://github.com/compodoc/compodoc/commit/a276dac)), closes [#20](https://github.com/compodoc/compodoc/issues/20)
* **menu:** display routes after all general items ([09a1caf](https://github.com/compodoc/compodoc/commit/09a1caf))
* **routing:** display lazy loading routes ([075670e](https://github.com/compodoc/compodoc/commit/075670e))
* **routing:** display routes length in overview ([a713aec](https://github.com/compodoc/compodoc/commit/a713aec))


### Bug Fixes

* **app:** [@link](https://github.com/link) parsing ([55564d6](https://github.com/compodoc/compodoc/commit/55564d6))
* **app:** add support for inheritanceand extends ([97cff59](https://github.com/compodoc/compodoc/commit/97cff59)), closes [#116](https://github.com/compodoc/compodoc/issues/116)
* **app:** components don't have the correct data depth ([b6f20e5](https://github.com/compodoc/compodoc/commit/b6f20e5)), closes [#111](https://github.com/compodoc/compodoc/issues/111)
* **app:** doesn't display routes pages if no routes ([d31d634](https://github.com/compodoc/compodoc/commit/d31d634))
* **app:** functionSignature args 0 ([d93a39d](https://github.com/compodoc/compodoc/commit/d93a39d))
* **app:** group misc by file, support of enums ([8031223](https://github.com/compodoc/compodoc/commit/8031223)), closes [#101](https://github.com/compodoc/compodoc/issues/101)
* **app:** menu modules page link ([f92f871](https://github.com/compodoc/compodoc/commit/f92f871))
* **app:** Multiple classes in the same file get the same description ([516ce47](https://github.com/compodoc/compodoc/commit/516ce47)), closes [#118](https://github.com/compodoc/compodoc/issues/118)
* **app:** node 4 spread support ([aa53770](https://github.com/compodoc/compodoc/commit/aa53770))
* **app:** promise sequential & node 4 ([354c0df](https://github.com/compodoc/compodoc/commit/354c0df))
* **app:** Promise TS support ([8eeccb9](https://github.com/compodoc/compodoc/commit/8eeccb9))
* **app:** Recognize ngOnInit() as a method | Angular Lifecycle hooks ([2f0d5c0](https://github.com/compodoc/compodoc/commit/2f0d5c0)), closes [#114](https://github.com/compodoc/compodoc/issues/114)
* **app:** support of functions ([fe4ecf8](https://github.com/compodoc/compodoc/commit/fe4ecf8)), closes [#110](https://github.com/compodoc/compodoc/issues/110)
* **app:** syntax highlightning / themes ([0822550](https://github.com/compodoc/compodoc/commit/0822550)), closes [#123](https://github.com/compodoc/compodoc/issues/123)
* **app:** watch changed file strategy details ([3544cd9](https://github.com/compodoc/compodoc/commit/3544cd9))
* **dependencies:** visitType error ([be6258d](https://github.com/compodoc/compodoc/commit/be6258d)), closes [#103](https://github.com/compodoc/compodoc/issues/103)
* **doc-coverage:** ignore private, handle constructor ([d4b7274](https://github.com/compodoc/compodoc/commit/d4b7274)), closes [#122](https://github.com/compodoc/compodoc/issues/122)
* **misc:** display file path ([8cd7a2e](https://github.com/compodoc/compodoc/commit/8cd7a2e)), closes [#101](https://github.com/compodoc/compodoc/issues/101)
* **routes:** handle no lazy module ([aa85c63](https://github.com/compodoc/compodoc/commit/aa85c63))

<a name="0.0.41"></a>
## 0.0.41 (2017-02-10)

### Bug Fixes

* **app:** remove TypeScript dependency for JSDoc tags ([3a30eb7](https://github.com/compodoc/compodoc/commit/3a30eb7))
* **app:** jsdoc tag example for component decorator ([786aea2](https://github.com/compodoc/compodoc/commit/786aea2)), closes [#100](https://github.com/compodoc/compodoc/issues/100), [#90](https://github.com/compodoc/compodoc/issues/90)
* **app:** UnhandledPromiseRejectionWarning ([e9fdea5](https://github.com/compodoc/compodoc/commit/e9fdea5)), closes [#100](https://github.com/compodoc/compodoc/issues/100), [#103](https://github.com/compodoc/compodoc/issues/103)

### Features

* **app** @example for pipe, component and directive decorators ([706322d](https://github.com/compodoc/compodoc/commit/706322d))

<a name="0.0.40"></a>
## 0.0.40 (2017-02-08)

### Bug Fixes

* **app:** ts.getJSDocTags availability ([b3af872](https://github.com/compodoc/compodoc/commit/b3af872)), closes [#104](https://github.com/compodoc/compodoc/issues/104), [#105](https://github.com/compodoc/compodoc/issues/105)
* **app:** exclude part of the project from documentation generation ([a7374a9](https://github.com/compodoc/compodoc/commit/a7374a9)), closes [#102](https://github.com/compodoc/compodoc/issues/102)

<a name="0.0.39"></a>
## 0.0.39 (2017-02-06)

### Bug Fixes

* **app:** Private methods and properties are skipped / align to typedoc ([8490983](https://github.com/compodoc/compodoc/commit/8490983)), closes [#99](https://github.com/compodoc/compodoc/issues/99)
* **app:** @link does not seem to be getting parsed for properties ([d1fd592](https://github.com/compodoc/compodoc/commit/d1fd592)), closes [#98](https://github.com/compodoc/compodoc/issues/98)
* **app:** support indexable object ([cceb933](https://github.com/compodoc/compodoc/commit/cceb933)), closes [#97](https://github.com/compodoc/compodoc/issues/97)
* **app:** Support @internal in the module level as well ([750cd63](https://github.com/compodoc/compodoc/commit/750cd63)), closes [#87](https://github.com/compodoc/compodoc/issues/87)
* **app:** miscellaneous support | variables and functions ([d758840](https://github.com/compodoc/compodoc/commit/d758840)), closes [#55](https://github.com/compodoc/compodoc/issues/55)
* **app:** remove base html tag, file:// support ([0e5227d](https://github.com/compodoc/compodoc/commit/0e5227d)), closes [#47](https://github.com/compodoc/compodoc/issues/47) [#35](https://github.com/compodoc/compodoc/issues/35)

### Features

* **app:** move to @compodoc/ngd ([311facb](https://github.com/compodoc/compodoc/commit/311facb))
* **app:** disablePrivateOrInternalSupport flag ([294d4e2](https://github.com/compodoc/compodoc/commit/294d4e2))

### Breaking changes

- base tag removed. The documentation can now be opened directly with a browser.


<a name="0.0.38"></a>
## 0.0.38 (2017-01-27)

### Bug Fixes

* **app:** ngd call for output path with spaces ([37fe0a6](https://github.com/compodoc/compodoc/commit/37fe0a6)), closes [#44](https://github.com/compodoc/compodoc/issues/44)
* **app:** class constructor test ([54b7c8e](https://github.com/compodoc/compodoc/commit/54b7c8e)), closes [#95](https://github.com/compodoc/compodoc/issues/95)
* **app:** test if constructor available ([bd1cb92](https://github.com/compodoc/compodoc/commit/bd1cb92))

<a name="0.0.37"></a>
## 0.0.37 (2017-01-26)

### Features

* **app:** extend directive documentation ([1637178](https://github.com/compodoc/compodoc/commit/1637178)), closes [#91](https://github.com/compodoc/compodoc/issues/91)
* **app:** Support for @example from JSDoc ([51cd282](https://github.com/compodoc/compodoc/commit/51cd282)), closes [#90](https://github.com/compodoc/compodoc/issues/90)
* **app:** Support for @link from JSDoc ([f05b7e7](https://github.com/compodoc/compodoc/commit/f05b7e7)), closes [#92](https://github.com/compodoc/compodoc/issues/92)
* **app:** include constructor method in docs ([ddd00dc](https://github.com/compodoc/compodoc/commit/ddd00dc)), closes [#94](https://github.com/compodoc/compodoc/issues/94)

<a name="0.0.36"></a>
## 0.0.36 (2017-01-23)

### Bug Fixes

* **app:** differentiate static members from instance members ([c8460eb](https://github.com/compodoc/compodoc/commit/c8460eb)), closes [#88](https://github.com/compodoc/compodoc/issues/88)

* **app:** modules menu items shows even if no modules ([af72453](https://github.com/compodoc/compodoc/commit/af72453)), closes [#89](https://github.com/compodoc/compodoc/issues/89)

* **app:** Image should resize to fit viewport ([2b24237](https://github.com/compodoc/compodoc/commit/2b24237)), closes [#83](https://github.com/compodoc/compodoc/issues/83)

* **app:** @input without type ([0f92ca4](https://github.com/compodoc/compodoc/commit/0f92ca4))

* **app:** file parsed doesn't exist ([eda183d](https://github.com/compodoc/compodoc/commit/eda183d))

* **app:** interface keys sorting with [key: string]: string; ([4e4c5cd](https://github.com/compodoc/compodoc/commit/4e4c5cd))

* **app:** component output type issue with NewExpression ([4e49d22](https://github.com/compodoc/compodoc/commit/4e49d22))

* **app:** parsing .d.ts ([e38b571](https://github.com/compodoc/compodoc/commit/e38b571))

<a name="0.0.35"></a>
## 0.0.35 (2017-01-20)

### Bug Fixes

* **app:** multi-line in description and code hightlight in jsdocs params ([816027e](https://github.com/compodoc/compodoc/commit/816027e)), closes [#79](https://github.com/compodoc/compodoc/issues/79) [#77](https://github.com/compodoc/compodoc/issues/77) [#76](https://github.com/compodoc/compodoc/issues/76)

* **app:** coverage report breaks ([462cf95](https://github.com/compodoc/compodoc/commit/462cf95)), closes [#65](https://github.com/compodoc/compodoc/issues/65) [#80](https://github.com/compodoc/compodoc/issues/80)

* **app:** dont link to files excluded via tsconfig ([3063f10](https://github.com/compodoc/compodoc/commit/3063f10)), closes [#59](https://github.com/compodoc/compodoc/issues/59)

### Features

* **app:** show component output `$event` type ([fa894f0](https://github.com/compodoc/compodoc/commit/fa894f0)), closes [#60](https://github.com/compodoc/compodoc/issues/60)

<a name="0.0.34"></a>
## 0.0.34 (2017-01-19)

### Bug Fixes

* **app:** nvm or nodejs / windows support ([0512c899](https://github.com/compodoc/compodoc/commit/0512c899)), closes [#44](https://github.com/compodoc/compodoc/issues/44)

### Features

* **app:** support external assets folder ([90ba24d](https://github.com/compodoc/compodoc/commit/90ba24d)), closes [#71](https://github.com/compodoc/compodoc/issues/71)

<a name="0.0.33"></a>
## 0.0.33 (2017-01-17)

### Bug Fixes

* **app:** handle path with spaces for ngd call ([8037285](https://github.com/compodoc/compodoc/commit/8037285)), closes [#44](https://github.com/compodoc/compodoc/issues/44)
* **app:** nvm-windows path issue ([7ac7373](https://github.com/compodoc/compodoc/commit/7ac7373)), closes [#65](https://github.com/compodoc/compodoc/issues/65)
* **app:** disable highlightjs line-numbers on bash code blocks ([96a6ff4](https://github.com/compodoc/compodoc/commit/96a6ff4)), closes [#64](https://github.com/compodoc/compodoc/issues/64)
* **app:** Cannot read property 'configuration' of undefined during external theme copy ([2127408](https://github.com/compodoc/compodoc/commit/2127408)), closes [#69](https://github.com/compodoc/compodoc/issues/69)

### Features

* **app:** JSDoc tags support ([bc5b01f](https://github.com/compodoc/compodoc/commit/bc5b01f)), closes [#68](https://github.com/compodoc/compodoc/issues/68)
* **app:** documentation coverage ([ddca8d4](https://github.com/compodoc/compodoc/commit/ddca8d4)), closes [#67](https://github.com/compodoc/compodoc/issues/67)

<a name="0.0.32"></a>
## 0.0.32 (2017-01-12)

### Bug Fix

* **app:** src argument handling ([14550f3](https://github.com/compodoc/compodoc/commit/14550f3)), closes [#63](https://github.com/compodoc/compodoc/issues/63)

<a name="0.0.31"></a>
## 0.0.31 (2017-01-11)

### Bug Fixes

* **app:** private properties in constructors ([2222446](https://github.com/compodoc/compodoc/commit/2222446)), closes [#61](https://github.com/compodoc/compodoc/issues/61)
* **app:** functionSignature with Angular APIs ([58316dd](https://github.com/compodoc/compodoc/commit/58316dd))

### Features

* **app:** link to Angular types ([0b33f74](https://github.com/compodoc/compodoc/commit/0b33f74)), closes [#57](https://github.com/compodoc/compodoc/issues/57)

<a name="0.0.30"></a>
## 0.0.30 (2017-01-10)

### Bug Fixes

* **app:** exclude internal members from generated documentation ([fc795c8](https://github.com/compodoc/compodoc/commit/fc795c8))
* **app:** passing src and ngd error ([c0cfb2f](https://github.com/compodoc/compodoc/commit/c0cfb2f))

### Features

* **app:** add an option to disable the graph ([927ed12](https://github.com/compodoc/compodoc/commit/927ed12))
* **app:** Link to others types ([10f72f7](https://github.com/compodoc/compodoc/commit/10f72f7)), closes [#58](https://github.com/compodoc/compodoc/issues/58)
* **app:** support TS shorthand for properties defined in constructor ([2965762](https://github.com/compodoc/compodoc/commit/2965762)), closes [#56](https://github.com/compodoc/compodoc/issues/56)

<a name="0.0.29"></a>
## 0.0.29 (2017-01-07)

### Bug Fixes

* **app:** handlebars breaking comments and highlightjs ([1347b74](https://github.com/compodoc/compodoc/commit/1347b74)), closes [#49](https://github.com/compodoc/compodoc/issues/49)
* **app:** Syntax highlighting issue with tabs ([54edaa0](https://github.com/compodoc/compodoc/commit/54edaa0)), closes [#50](https://github.com/compodoc/compodoc/issues/50)

### Features

* **cli:** Source folder option handling ([c3e86c6](https://github.com/compodoc/compodoc/commit/c3e86c6)), closes [#48](https://github.com/compodoc/compodoc/issues/48)

<a name="0.0.28"></a>
## 0.0.28 (2017-01-03)

### Bug Fixes

* **app:** open and port flag ([a34b39a](https://github.com/compodoc/compodoc/commit/a34b39a)), closes [#45](https://github.com/compodoc/compodoc/issues/45)
* **design:** search input color ([a0fd0fe](https://github.com/compodoc/compodoc/commit/a0fd0fe))

<a name="0.0.27"></a>
## 0.0.27 (2017-01-03)

### Bug Fixes

* **app:** graph generation with path with spaces ([e833251](https://github.com/compodoc/compodoc/commit/e833251)), closes [#43](https://github.com/compodoc/compodoc/issues/43), [#44](https://github.com/compodoc/compodoc/issues/44)

<a name="0.0.26"></a>
## 0.0.26 (2016-12-31)

### Bug Fixes

* **app:** bin renaming ([557a0d1](https://github.com/compodoc/compodoc/commit/557a0d1))

<a name="0.0.25"></a>
## 0.0.25 (2016-12-31)

### Features

* **app:** source code tab ([8824e75](https://github.com/compodoc/compodoc/commit/8824e75))
* **app:** toggle buttons for menu ([4037259](https://github.com/compodoc/compodoc/commit/4037259))

<a name="0.0.24"></a>
## 0.0.24 (2016-12-28)

### Bug Fixes

* **dependencies:** handle @injectable and @component at the same time for metadata ([f4d5ce8](https://github.com/compodoc/compodoc/commit/f4d5ce8)), closes [#41](https://github.com/compodoc/compodoc/issues/41)

### Features

* **app:** library mode support, for gulp-compodoc ([5a65d87](https://github.com/compodoc/compodoc/commit/5a65d87))

<a name="0.0.23"></a>
## 0.0.23 (2016-12-15)

### Bug Fixes

* **dependencies:** multiple class declarations in one file ([fbc0d7b](https://github.com/compodoc/compodoc/commit/fbc0d7b)), closes [#37](https://github.com/compodoc/compodoc/issues/37)

### Features

* **doc:** details for supported comments ([86851ca](https://github.com/compodoc/compodoc/commit/86851ca)), closes [#36](https://github.com/compodoc/compodoc/issues/36)

<a name="0.0.22"></a>
## 0.0.22 (2016-12-12)

### Bug Fixes

* **routes:** support for multiple components for same route ([5782415](https://github.com/compodoc/compodoc/commit/5782415)), closes [#33](https://github.com/compodoc/compodoc/issues/33)

### Features

* **routes:** extend routes page : empty path, pathMatch ([4474973](https://github.com/compodoc/compodoc/commit/4474973))

<a name="0.0.21"></a>
## 0.0.21 (2016-12-12)

### Bug Fixes

* **app:** es6 object.assign support ([6c25f59](https://github.com/compodoc/compodoc/commit/6c25f59))

<a name="0.0.20"></a>
## 0.0.20 (2016-12-12)

### Features

* **search:** search bar ([3e3c8d0](https://github.com/compodoc/compodoc/commit/3e3c8d0))
* **app:** add interfaces management ([896f233](https://github.com/compodoc/compodoc/commit/896f233))

<a name="0.0.19"></a>
## 0.0.19 (2016-12-08)

### Bug Fixes

* **menu:**  scroll to active link ([1c1ef1f](https://github.com/compodoc/compodoc/commit/1c1ef1f)), closes [#27](https://github.com/compodoc/compodoc/issues/27)
* **menu:**  simple routes or modules entry active class ([ec81568](https://github.com/compodoc/compodoc/commit/ec81568))
* **dependencies:**  don't stop on routes parsing errors ([cef716b](https://github.com/compodoc/compodoc/commit/cef716b)), closes [#26](https://github.com/compodoc/compodoc/issues/26)
* **app:**  default serving port flag ([ea5ec23](https://github.com/compodoc/compodoc/commit/ea5ec23)), closes [#29](https://github.com/compodoc/compodoc/issues/29)

<a name="0.0.18"></a>
## 0.0.18 (2016-12-05)

### Features

* **design:**  7 new themes ([740e165](https://github.com/compodoc/compodoc/commit/740e165))

<a name="0.0.17"></a>
## 0.0.17 (2016-12-01)

### Bug Fixes

* **chore:**  update supported version to Node.js 7+ ([8a8e0f6](https://github.com/compodoc/compodoc/commit/8a8e0f6)), closes [#18](https://github.com/compodoc/compodoc/issues/18)

<a name="0.0.16"></a>
## 0.0.16 (2016-11-29)

### Bug Fixes

* **app:**  support old Node.js versions using babel ([8b9139c](https://github.com/compodoc/compodoc/commit/8b9139c)), closes [#25](https://github.com/compodoc/compodoc/issues/25)

### Features

* **app:** delete top navbar, prepare for next design release ([9c1d7c2](https://github.com/compodoc/compodoc/commit/9c1d7c2))

<a name="0.0.15"></a>
## 0.0.15 (2016-11-16)

### Bug Fixes

* **overview:** blocks alignment ([6738c22](https://github.com/compodoc/compodoc/commit/6738c22))
* **parsing:** class methods issue ([05316cb](https://github.com/compodoc/compodoc/commit/05316cb))
* **parsing:** don't create ts program for each child on a file, 300% boost ! ([9f754cd](https://github.com/compodoc/compodoc/commit/9f754cd))

<a name="0.0.14"></a>
## 0.0.14 (2016-11-15)

### Bug Fixes

* **dependencies:** display uncommented functions or variables ([a9b47c2](https://github.com/compodoc/compodoc/commit/a9b47c2)), closes [#21](https://github.com/compodoc/compodoc/issues/21)

### Features

* **app:** syntax highlighting for markdowns files ([c4800a7](https://github.com/compodoc/compodoc/commit/c4800a7)), closes [#19](https://github.com/compodoc/compodoc/issues/19)

<a name="0.0.13"></a>
## 0.0.13 (2016-11-15)

### Features

* **app:** support of one README.md file for each component ([f1c626d](https://github.com/compodoc/compodoc/commit/f1c626d)), closes [#10](https://github.com/compodoc/compodoc/issues/10)

<a name="0.0.12"></a>
## 0.0.12 (2016-11-13)

### Features

* **app:** provide external styling theme file ([3e4f98c](https://github.com/compodoc/compodoc/commit/3e4f98c)), closes [#9](https://github.com/compodoc/compodoc/issues/9)

<a name="0.0.11"></a>
## 0.0.11 (2016-11-13)

### Bug Fixes

* **dependencies:** windows file path issue ([2567f87](https://github.com/compodoc/compodoc/commit/2567f87)), closes [#14](https://github.com/compodoc/compodoc/issues/14)

<a name="0.0.10"></a>
## 0.0.10 (2016-11-12)

### Bug Fixes

* **app:** logo is overlaying menu ([71aad4b](https://github.com/compodoc/compodoc/commit/71aad4b)), closes [#13](https://github.com/compodoc/compodoc/issues/13)

<a name="0.0.9"></a>
## 0.0.9 (2016-11-12)

### Bug Fixes

* **app:** exclude by default node_modules folder ([69b1e4d](https://github.com/compodoc/compodoc/commit/69b1e4d)), closes [#11](https://github.com/compodoc/compodoc/issues/11)
* **app:** handle ; after function in class ([eb7c7e1](https://github.com/compodoc/compodoc/commit/eb7c7e1)), closes [#12](https://github.com/compodoc/compodoc/issues/12)

### Features

* **app:** add nyc and codecovfeat ([775875b](https://github.com/compodoc/compodoc/commit/775875b))
* **routes:** display redirectTo ([e7448e7](https://github.com/compodoc/compodoc/commit/e7448e7))
* **app:** display error for routes parsing ([69a52d7](https://github.com/compodoc/compodoc/commit/69a52d7))

<a name="0.0.8"></a>
## 0.0.8 (2016-11-11)

### Bug Fixes

* **app:** isGlobal npm context test ([3ddc9ce](https://github.com/compodoc/compodoc/commit/3ddc9ce))

<a name="0.0.7"></a>
## 0.0.7 (2016-11-11)

### Bug Fixes

* **app:** local call of ngd, even compodoc installed globally or locally ([8393fc0](https://github.com/compodoc/compodoc/commit/8393fc0)), closes [#5](https://github.com/compodoc/compodoc/issues/5)
* **app:** local/global call of ngd ([b9163a7](https://github.com/compodoc/compodoc/commit/b9163a7))
* **app:** handle -s -d and -p correctly ([dc0b388](https://github.com/compodoc/compodoc/commit/dc0b388)), closes [#6](https://github.com/compodoc/compodoc/issues/6)

### Features

* **app:** rename file flag to tsconfig flag, details for base flag ([3b21bc0](https://github.com/compodoc/compodoc/commit/3b21bc0))
* **app:** specify Node.js version ([c394caf](https://github.com/compodoc/compodoc/commit/c394caf))

### Breaking changes

* -f flag is now -p flag. More similar to tsc flags.

<a name="0.0.6"></a>
## 0.0.6 (2016-11-10)

### Bug Fixes

* **app:** handlebars not in the dependencies list ([38aa0d6d](https://github.com/compodoc/compodoc/commit/38aa0d6d))

<a name="0.0.5"></a>
## 0.0.5 (2016-11-09)

### Bug Fixes

* **app:** handle false-positives ([f4e9d8a2](https://github.com/compodoc/compodoc/commit/f4e9d8a2))
* **app:** fix class items ([295e9f81](https://github.com/compodoc/compodoc/commit/295e9f81))

<a name="0.0.4"></a>
## 0.0.4 (2016-11-08)

### Bug Fixes

* **overview:** syntax ([995696ea](https://github.com/compodoc/compodoc/commit/995696ea))

### Features

* **app:** routes support ([8fe00e6f](https://github.com/compodoc/compodoc/commit/8fe00e6f))

<a name="0.0.3"></a>
## 0.0.3 (2016-11-08)

### Bug Fixes

* **app:** title argument ([4b37cf2](https://github.com/compodoc/compodoc/commit/4b37cf2))
* **app:** css for menu, scroll bounce, mobile main height ([839a49a](https://github.com/compodoc/compodoc/commit/839a49a))

### Features

* **app:** simple classes support ([35f2cc5](https://github.com/compodoc/compodoc/commit/35f2cc5))

<a name="0.0.2"></a>
## 0.0.2 (2016-11-07)

### Bug Fixes

* **modules:** link to each module page ([5673341](https://github.com/compodoc/compodoc/commit/5673341))
* **module:**  exclude Angular2 modules, WIP... ([0bc5dff3](https://github.com/compodoc/compodoc/commit/0bc5dff3))
* **deps:** cleaning ([c817d4d](https://github.com/compodoc/compodoc/commit/c817d4d))

### Features

* **app:** details on local server while serving ([0bc5dff](https://github.com/compodoc/compodoc/commit/0bc5dff))
* **app:** display elapsed time for generation ([14c5bfd](https://github.com/compodoc/compodoc/commit/14c5bfd))
* **html-engine:** put main page in cache ([d2a9937](https://github.com/compodoc/compodoc/commit/d2a9937))
* **app:** silent mode ([005e64b](https://github.com/compodoc/compodoc/commit/005e64b))
* **app:** update screenshots ([c33b729](https://github.com/compodoc/compodoc/commit/c33b729))
* **app:** vectorised logo ([5de613b](https://github.com/compodoc/compodoc/commit/5de613b))
* **app:** mobile menu ([b7ab594](https://github.com/compodoc/compodoc/commit/b7ab594))

<a name="0.0.1"></a>
## 0.0.1 (2016-11-07)

Initial release

### Features

Support of :
- components
- modules
- directives
- pipes
- injectables
