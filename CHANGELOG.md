<a name="1.1.25"></a>

## [1.1.25](https://github.com/compodoc/compodoc/compare/1.1.24...1.1.25)

### Merged

-   style(templates): Fix typo in dark mode comments [#1476](https://github.com/compodoc/compodoc/pull/1476), Thanks [Keiishu](https://github.com/Keiishu)

### Bug fixes

-   fix(app): PDF.js vulnerability CVE-2024-4367 ([ca5089b](https://github.com/compodoc/compodoc/commit/ca5089b)), closes [#1478](https://github.com/compodoc/compodoc/issues/1478)
-   fix(app): remove deprecated @babel/plugin-proposal-private-methods ([b651a63](https://github.com/compodoc/compodoc/commit/b651a63)), closes [#1475](https://github.com/compodoc/compodoc/issues/1475)
-   fix(app): mobile display ([d4e8878](https://github.com/compodoc/compodoc/commit/d4e8878)), closes [#1473](https://github.com/compodoc/compodoc/issues/1473)
-   fix(app): support input models | first level of syntax support ([3b41147](https://github.com/compodoc/compodoc/commit/3b41147)), closes [#1474](https://github.com/compodoc/compodoc/issues/1474)

<a name="1.1.24"></a>

## [1.1.24](https://github.com/compodoc/compodoc/compare/1.1.23...1.1.24)

### Merged

-   docs: fixed typos [#1470](https://github.com/compodoc/compodoc/pull/1470), Thanks [grjan7](https://github.com/grjan7)
-   docs: update readability [#1467](https://github.com/compodoc/compodoc/pull/1467), Thanks [grjan7](https://github.com/grjan7)
-   fix(app): remove trailing commas from routes [#1451](https://github.com/compodoc/compodoc/pull/1451), Thanks [raizorlol](https://github.com/raizorlol)
-   feat(app): display inputsignals as inputs rather than properties [#1439](https://github.com/compodoc/compodoc/pull/1439), Thanks [astrutz](https://github.com/astrutz)
-   feat(app): disableConstructors for components, directives, services and pipes [#1437](https://github.com/compodoc/compodoc/pull/1437), Thanks [astrutz](https://github.com/astrutz)

### Bug fixes

-   fix(app): toggle dark mode on page loading ([256430d](https://github.com/compodoc/compodoc/commit/256430d)), closes [#1456](https://github.com/compodoc/compodoc/issues/1456)
-   feat(app): bump dev/dependencies ([09b0e88](https://github.com/compodoc/compodoc/commit/09b0e88)), closes [#1362](https://github.com/compodoc/compodoc/issues/1362)
-   fix(app): support TypeScript aliases for extends ([a0840ff](https://github.com/compodoc/compodoc/commit/a0840ff)), closes [#1427](https://github.com/compodoc/compodoc/issues/1427)
-   fix(app): correct test for styles, styleUrls, styleUrl ([bfbc48f](https://github.com/compodoc/compodoc/commit/bfbc48f)), closes [#1444](https://github.com/compodoc/compodoc/issues/1444)
-   feat(app): outputs signal supports ([2e36d95](https://github.com/compodoc/compodoc/commit/2e36d95)), closes [#1443](https://github.com/compodoc/compodoc/issues/1443) ([2e36d95](https://github.com/compodoc/compodoc/commit/2e36d95)), closes [#1439](https://github.com/compodoc/compodoc/issues/1439)

## [1.1.23](https://github.com/compodoc/compodoc/compare/1.1.22...1.1.23)

### Merged

-   Update translations in ru-RU locale, sort strings [#1396](https://github.com/compodoc/compodoc/pull/1396), Thanks [Eugeno](https://github.com/Eugeno)
-   Update translations in ru-RU locale, refactor i18n sorting and translation strings [9861d8c](https://github.com/compodoc/compodoc/commit/9861d8ccc3065a4bf82126d552c13eddf4e58dc0)
-   feat: georgian language support [#1392](https://github.com/compodoc/compodoc/pull/1392), Thanks [KostaD02](https://github.com/KostaD02)

### Bug fixes

-   fix(dark-mode): avoid flickering when navigating between pages ([0ff45cd](https://github.com/compodoc/compodoc/commit/0ff45cd)), closes [#1397](https://github.com/compodoc/compodoc/issues/1397)

<a name="1.1.22"></a>

## [1.1.22](https://github.com/compodoc/compodoc/compare/1.1.21...1.1.22)

### Merged

-   Added Russian translation [#1386](https://github.com/compodoc/compodoc/pull/1386), Thanks [RusFjord](https://github.com/RusFjord)
-   docs: updated the tags in the readme file [#1365](https://github.com/compodoc/compodoc/pull/1365), Thanks [alkavats1](https://github.com/alkavats1)

### Bug fixes

-   fix(app): @example render twice for methods ([f5d6f97](https://github.com/compodoc/compodoc/commit/f5d6f97)), closes [#1385](https://github.com/compodoc/compodoc/issues/1385)
-   fix(app): interfaces multiple extends support ([229f407](https://github.com/compodoc/compodoc/commit/229f407)), closes [#1364](https://github.com/compodoc/compodoc/issues/1364)
-   fix(app): relax @angular-devkit/schematics version for Angular v14.x support ([51fe4b9](https://github.com/compodoc/compodoc/commit/51fe4b9)), closes [#1362](https://github.com/compodoc/compodoc/issues/1362)
-   fix(app): disableLifeCycleHooks for pipes and services ([753b74d](https://github.com/compodoc/compodoc/commit/753b74d)), closes [#1369](https://github.com/compodoc/compodoc/issues/1369)
-   fix(app): json export and disableSourceCode - template and style sources should not be added ([6a85f1b](https://github.com/compodoc/compodoc/commit/6a85f1b)), closes [#1370](https://github.com/compodoc/compodoc/issues/1370)
-   fix(app): remove inside dependency no longer used, bump dev/Dependencies ([91865b7](https://github.com/compodoc/compodoc/commit/91865b7)), closes [#1355](https://github.com/compodoc/compodoc/issues/1355)

<a name="1.1.21"></a>

## [1.1.21](https://github.com/compodoc/compodoc/compare/1.1.20...1.1.21)

### Bug fixes

-   feat(app): downgrade Marked version ([e0a4b78](https://github.com/compodoc/compodoc/commit/e0a4b78)), closes [#1349](https://github.com/compodoc/compodoc/issues/1349)

<a name="1.1.20"></a>

## [1.1.20](https://github.com/compodoc/compodoc/compare/1.1.19...1.1.20) - 2023-05-23

### Merged

-   fix(Input): Add support for Object Expressions in Input decorators [#1326](https://github.com/compodoc/compodoc/pull/1326), Thanks [valentinpalkovic](https://github.com/valentinpalkovic)
-   fix(app): overview depth [#1310](https://github.com/compodoc/compodoc/pull/1310), Thanks [albeniraouf](https://github.com/albeniraouf)
-   Translates to Bulgarian [#1312](https://github.com/compodoc/compodoc/pull/1312), Thanks [3phase](https://github.com/3phase)

### Bug fixes

-   feat(app): Directive composition API for directives and components ([127076a](https://github.com/compodoc/compodoc/commit/127076a)), closes [#1340](https://github.com/compodoc/compodoc/issues/1340)
-   feat(app): Required Inputs ([e1a5396](https://github.com/compodoc/compodoc/commit/e1a5396)), closes [#1340](https://github.com/compodoc/compodoc/issues/1340)
-   feat(app): Standalone components, directives and pipes support ([cb02ca0](https://github.com/compodoc/compodoc/commit/cb02ca0)), closes [#1323](https://github.com/compodoc/compodoc/issues/1323)
-   fix(app): support exportAs for directives ([76a8f34](https://github.com/compodoc/compodoc/commit/76a8f34)), closes [#1328](https://github.com/compodoc/compodoc/issues/1328)
-   feat(app): bump @compodoc/ngd-transformer ([ef9bd94](https://github.com/compodoc/compodoc/commit/ef9bd94)), closes [#1311](https://github.com/compodoc/compodoc/issues/1311)
-   fix(app): service/injectable export in module providers ([34967a9](https://github.com/compodoc/compodoc/commit/34967a9)), closes [#1290](https://github.com/compodoc/compodoc/issues/1290)
-   fix(app): missing rel attribute with \_blank links ([c8379e0](https://github.com/compodoc/compodoc/commit/c8379e0)), closes [#1282](https://github.com/compodoc/compodoc/issues/1282)
-   feat(app): Add specific id in each html section ([03ac1ad](https://github.com/compodoc/compodoc/commit/03ac1ad)), closes [#1241](https://github.com/compodoc/compodoc/issues/1241)
-   fix(app): Invalid links to a class when the class name includes an interface name ([047cedb](https://github.com/compodoc/compodoc/commit/047cedb)), closes [#1239](https://github.com/compodoc/compodoc/issues/1239)
-   fix(routing): path wrongly resolved during routing analysis ([1722ca3](https://github.com/compodoc/compodoc/commit/1722ca3)), closes [#1170](https://github.com/compodoc/compodoc/issues/1170)

<a name="1.1.19"></a>

## [1.1.19](https://github.com/compodoc/compodoc/compare/1.1.18...1.1.19) (2022-01-10)

### Merged

-   feat: fully parse set accessor type [#1194](https://github.com/compodoc/compodoc/pull/1194), thanks [Killusions](https://github.com/Killusions)

### Bug fixes

-   fix(menu): custom-logo links are broken for doc deployments with a path ([bd28dd0](https://github.com/compodoc/compodoc/commit/bd28dd0)), closes [#1203](https://github.com/compodoc/compodoc/issues/1203)
-   feat(app): display project properties from package.json file ([b091e19](https://github.com/compodoc/compodoc/commit/b091e19)), closes [#1198](https://github.com/compodoc/compodoc/issues/1198)
-   fix(app): Nestjs controllers class inheritance ([06dad8c](https://github.com/compodoc/compodoc/commit/06dad8c)), closes [#1140](https://github.com/compodoc/compodoc/issues/1140)
-   fix(app): Directive class inheritance ([765f496](https://github.com/compodoc/compodoc/commit/765f496)), closes [#1140](https://github.com/compodoc/compodoc/issues/1140)
-   feat(app): JSDoc tag @internal correct support ([18da1fe](https://github.com/compodoc/compodoc/commit/18da1fe)), closes [#1101](https://github.com/compodoc/compodoc/issues/1101)
-   fix(app): @example correct support ([9a1a7e1](https://github.com/compodoc/compodoc/commit/9a1a7e1)), closes [#1099](https://github.com/compodoc/compodoc/issues/1099)
-   fix(app): double layer spread support for modules ([e25a4ee](https://github.com/compodoc/compodoc/commit/e25a4ee)), closes [#979](https://github.com/compodoc/compodoc/issues/979)

<a name="1.1.18"></a>

## [1.1.18](https://github.com/compodoc/compodoc/compare/1.1.17...1.1.18) (2022-01-10)

Fix for colors dependency.

<a name="1.1.17"></a>

## [1.1.17](https://github.com/compodoc/compodoc/compare/1.1.16...1.1.17) (2022-01-09)

### Features

-   feat(app): Nest @entity support ([2dfe88a](https://github.com/compodoc/compodoc/commit/2dfe88a)), closes [#1131](https://github.com/compodoc/compodoc/issues/1131)
-   feat(app): ng-add schematics ([7a414d4](https://github.com/compodoc/compodoc/commit/7a414d4)), closes [#1155](https://github.com/compodoc/compodoc/issues/1155)

### Merged

-   fix(app): Fix enum member types parsing [#1159](https://github.com/compodoc/compodoc/pull/1159)
-   fix(app): Fix reading class decorators [#1158](https://github.com/compodoc/compodoc/pull/1158)

### Bug fixes

-   fix(UI): Dark mode toggle doesn't persist when switching pages ([1013cda](https://github.com/compodoc/compodoc/commit/1013cda)), closes [#1167](https://github.com/compodoc/compodoc/issues/1167)
-   fix(app): custom-logo links are broken for child content ([db47436](https://github.com/compodoc/compodoc/commit/db47436)), closes [#1147](https://github.com/compodoc/compodoc/issues/1147)
-   fix(app): support for backtick in Routing lazy-loading syntax ([cff2ca5](https://github.com/compodoc/compodoc/commit/cff2ca5)), closes [#1164](https://github.com/compodoc/compodoc/issues/1164)
-   fix(app): wrong additional folder provided, exit with code 0 ([15fd3de](https://github.com/compodoc/compodoc/commit/15fd3de)), closes [#1146](https://github.com/compodoc/compodoc/issues/1146)
-   fix(app): link in description to class ([2b6af73](https://github.com/compodoc/compodoc/commit/2b6af73)), closes [#1157](https://github.com/compodoc/compodoc/issues/1157)

<a name="1.1.16"></a>

## [1.1.16](https://github.com/compodoc/compodoc/compare/1.1.15...1.1.16) (2021-11-23)

### Features

-   feat(app): dark mode toggle button ([97d2763](https://github.com/compodoc/compodoc/commit/97d2763)), closes [#1127](https://github.com/compodoc/compodoc/issues/1127)

### Merged

-   fix: Routing aliases [#1148](https://github.com/compodoc/compodoc/pull/1148), Thanks [Bengejd](https://github.com/Bengejd)
-   feat(i18n): Traditional Chinese language [#1151](https://github.com/compodoc/compodoc/pull/1151), Thanks [doggy8088](https://github.com/doggy8088)
-   fix(link-parser): avoid crashing with invalid links [#1136](https://github.com/compodoc/compodoc/pull/1136), Thanks [sandrafreihofer](https://github.com/sandrafreihofer)
-   feat: add decorators to class inputs [#1135](https://github.com/compodoc/compodoc/pull/1135), Thanks [sandrafreihofer](https://github.com/sandrafreihofer)
-   fix(app): change layout in modules template [#1132](https://github.com/compodoc/compodoc/pull/1132), Thanks [ddubrava](https://github.com/ddubrava)

### Bug fixes

-   fix(app): multi decorators support ([3814299](https://github.com/compodoc/compodoc/commit/3814299)), closes [#1128](https://github.com/compodoc/compodoc/issues/1128)
-   fix(app): URL parsing when using @link for @inputs ([95e4945](https://github.com/compodoc/compodoc/commit/95e4945)), closes [#1125](https://github.com/compodoc/compodoc/issues/1125)

<a name="1.1.15"></a>

## [1.1.15](https://github.com/compodoc/compodoc/compare/1.1.14...1.1.15) (2021-09-17)

### Merged

-   fix(app): fixes a bug in CORS that only allows specific content types, Fi… [#1120](https://github.com/compodoc/compodoc/pull/1120)
-   fix(i18n): fix misspeling in pt-BR translation [#1107](https://github.com/compodoc/compodoc/pull/1107)
-   fix(app): show custom logo even when in dark mode [#1103](https://github.com/compodoc/compodoc/pull/1103)

### Bug fixes

-   fix(app): @link in @see JSDoc tag ([ba13a85](https://github.com/compodoc/compodoc/commit/ba13a85)), closes [#1104](https://github.com/compodoc/compodoc/issues/1104)
-   fix(app): component template import parsing ([b31604c](https://github.com/compodoc/compodoc/commit/b31604c)), closes [#1121](https://github.com/compodoc/compodoc/issues/1121)
-   fix(app): Fixes a bug in CORS that only allows specific content types, Fixes #1109 ([71ab9d3](https://github.com/compodoc/compodoc/commit/71ab9d3)), closes [#1109](https://github.com/compodoc/compodoc/issues/1109)
-   fix(app): last sentences, exporting html with locale option ([85d183e](https://github.com/compodoc/compodoc/commit/85d183e)), closes [#365](https://github.com/compodoc/compodoc/issues/365)
-   fix(app): use normalized paths in unit test coverage ([43bbc3b](https://github.com/compodoc/compodoc/commit/43bbc3b)), closes [#664](https://github.com/compodoc/compodoc/issues/664)
-   fix(app): JSDoc @param tag with @link ([55eb258](https://github.com/compodoc/compodoc/commit/55eb258)), closes [#294](https://github.com/compodoc/compodoc/issues/294)
-   fix(app): ES6 destructuring assignment support ([254e8cd](https://github.com/compodoc/compodoc/commit/254e8cd)), closes [#502](https://github.com/compodoc/compodoc/issues/502)
-   fix(app): webcomponent menu transpilation with Babel and missing filename config for @babel/preset-env ([10f73a5](https://github.com/compodoc/compodoc/commit/10f73a5)), closes [#1100](https://github.com/compodoc/compodoc/issues/1100)
-   fix(app): lazy routing with async - await ([150d97a](https://github.com/compodoc/compodoc/commit/150d97a)), closes [#1042](https://github.com/compodoc/compodoc/issues/1042)

<a name="1.1.14"></a>

## [1.1.14](https://github.com/compodoc/compodoc/compare/1.1.13...1.1.14) (2021-07-14)

Use now TypeScript 4.3.5

### Bug fixes

-   fix(app): support for Type Reference and template literal ([c1282d2](https://github.com/compodoc/compodoc/commit/c1282d2)), closes [#1053](https://github.com/compodoc/compodoc/issues/1053)
-   fix(app): @input/@ouput not duplicated with properties ([f42fc69](https://github.com/compodoc/compodoc/commit/f42fc69)), closes [#1095](https://github.com/compodoc/compodoc/issues/1095)
-   fix(routing): Angular Import does not support return type ([f324108](https://github.com/compodoc/compodoc/commit/f324108)), closes [#1097](https://github.com/compodoc/compodoc/issues/1097)
-   fix(routing): async lazy -load should not fail ([0cc736b](https://github.com/compodoc/compodoc/commit/0cc736b)), closes [#1096](https://github.com/compodoc/compodoc/issues/1096)
-   fix(app): TypeScript private APIs mapping + ECMAScript Private Fields and methods ([8b71b59](https://github.com/compodoc/compodoc/commit/8b71b59)), closes [#1094](https://github.com/compodoc/compodoc/issues/1094)
-   fix(app): drop usage of ts-simple-ast for ts-morph [7bb9a40](https://github.com/compodoc/compodoc/commit/7bb9a409ad4e7a30226656198fd38c6028662020)
-   fix(theme): dark mode support [0c7a052](https://github.com/compodoc/compodoc/commit/0c7a0522b91d6837888cedf46a5b3af51561b192)

<a name="1.1.13"></a>

## [1.1.13](https://github.com/compodoc/compodoc/compare/1.1.12...1.1.13) (2021-07-09)

### Features

-   feat(cli): Support --watch with --exportFormat json ([fdfe925](https://github.com/compodoc/compodoc/commit/fdfe925)), closes [#1087](https://github.com/compodoc/compodoc/issues/1087)

### Bug fixes

-   fix(dark): better dark mode ([f93090b](https://github.com/compodoc/compodoc/commit/f93090b)), closes [#1092](https://github.com/compodoc/compodoc/issues/1092)
-   fix(cli): remove sleep package | wait 10s if --inspect flag in CONTRIBUTING.md and docs/README.md ([a1d5a1a](https://github.com/compodoc/compodoc/commit/a1d5a1a)), closes [#1090](https://github.com/compodoc/compodoc/issues/1090)

<a name="1.1.12"></a>

## [1.1.12](https://github.com/compodoc/compodoc/compare/1.1.11...1.1.12) (2021-07-07)

Thanks to all contributors ! 👏

### Features

-   feat(app): @deprecated support [0b2ecde](https://github.com/compodoc/compodoc/commit/0b2ecdee790996c887826fdf2b8a2c6edaea2211) [#1032](https://github.com/compodoc/compodoc/pull/1032)
-   feat(i18n): Korean language [#1030](https://github.com/compodoc/compodoc/pull/1030)
-   feat(i18n): Polish language [#991](https://github.com/compodoc/compodoc/pull/991)
-   feat(app): add support for inferred input types [#998](https://github.com/compodoc/compodoc/pull/998)
-   feat(app): Dark mode support ([2bb51cb](https://github.com/compodoc/compodoc/commit/2bb51cb)), closes [#1064](https://github.com/compodoc/compodoc/issues/1064)
-   feat(app): add support for inferred input types ([11c4a68](https://github.com/compodoc/compodoc/commit/11c4a68)), closes [#896](https://github.com/compodoc/compodoc/issues/896)

### Merged

-   HTTPS link in .editorconfig [#1083](https://github.com/compodoc/compodoc/pull/1083)
-   fix(app): fix some bug reports with angular &gt;= 9 and extended classes in components [#1037](https://github.com/compodoc/compodoc/pull/1037)
-   fix(app): merge overridden with inherited class members so they are not duplicated in the generated docs [#1035](https://github.com/compodoc/compodoc/pull/1035)
-   provide jsdoctags [#1001](https://github.com/compodoc/compodoc/pull/1001)
-   Add raw descriptions [#949](https://github.com/compodoc/compodoc/pull/949)
-   Angular lazy loading fix - extra undefined check in router-parser [#924](https://github.com/compodoc/compodoc/pull/924)
-   fix: generating documentation on project including inacessible folders [#916](https://github.com/compodoc/compodoc/pull/916)
-   fix(cli): tsx files not considered in include entries [#906](https://github.com/compodoc/compodoc/pull/906)
-   Fix: Added missing guards and interceptors to the json exporter. [#847](https://github.com/compodoc/compodoc/pull/847)
-   updates locales for de-DE [#861](https://github.com/compodoc/compodoc/pull/861)
-   update(angular-util): update findApi to reduce runtime [#858](https://github.com/compodoc/compodoc/pull/858)

### Bug fixes

-   fix(app): directive with no option, and inheritance between component and directives ([a6c678c](https://github.com/compodoc/compodoc/commit/a6c678c)), closes [#984](https://github.com/compodoc/compodoc/issues/984)
-   fix(app): main comment parsing for ``` ([3226d01](https://github.com/compodoc/compodoc/commit/3226d01)), closes [#1059](https://github.com/compodoc/compodoc/issues/1059)
-   fix(app): setters arguments correctly documented ([8190df5](https://github.com/compodoc/compodoc/commit/8190df5)), closes [#1062](https://github.com/compodoc/compodoc/issues/1062)
-   Merge pull request #1032 from Killusions/feat/parse-jsdoc-deprecated ([2ff7c21](https://github.com/compodoc/compodoc/commit/2ff7c21)), closes [#937](https://github.com/compodoc/compodoc/issues/937)
-   fix(app): generic support in function arguments ([6b9a1d0](https://github.com/compodoc/compodoc/commit/6b9a1d0)), closes [#1076](https://github.com/compodoc/compodoc/issues/1076)
-   fix(app): inheritance & Properties and methods are being duplicate ([3dd3e27](https://github.com/compodoc/compodoc/commit/3dd3e27)), closes [#1034](https://github.com/compodoc/compodoc/issues/1034)
-   fix(app): multiple hostlisteners support ([2837cea](https://github.com/compodoc/compodoc/commit/2837cea)), closes [#1022](https://github.com/compodoc/compodoc/issues/1022)
-   fix(app): more prism languages support ([816f6e1](https://github.com/compodoc/compodoc/commit/816f6e1)), closes [#1048](https://github.com/compodoc/compodoc/issues/1048)
-   fix(app): spread and tuple type support ([c7cd839](https://github.com/compodoc/compodoc/commit/c7cd839)), closes [#1052](https://github.com/compodoc/compodoc/issues/1052)
-   fix(app): Overview page not scrolling ([fe9cd04](https://github.com/compodoc/compodoc/commit/fe9cd04)), closes [#997](https://github.com/compodoc/compodoc/issues/997)
-   fix(app): Directives missing "rawdescription" in JSON output ([7d7e1a9](https://github.com/compodoc/compodoc/commit/7d7e1a9)), closes [#875](https://github.com/compodoc/compodoc/issues/875)
-   fix(coverage): function links in documentation coverage are broken ([59f2902](https://github.com/compodoc/compodoc/commit/59f2902)), closes [#859](https://github.com/compodoc/compodoc/issues/859)
-   fix(cli): tsconfig with files and include entries ([baf122c](https://github.com/compodoc/compodoc/commit/baf122c)), closes [#860](https://github.com/compodoc/compodoc/issues/860)

<a name="1.1.11"></a>

# [1.1.11](https://github.com/compodoc/compodoc/compare/1.1.10...1.1.11) (2019-10-15)

### Features

-   feat(i18n): de-DE language [#810](https://github.com/compodoc/compodoc/pull/810) Thanks [hueppee](https://github.com/hueppee)
-   feat(i18n): sk-SK language [#830](https://github.com/compodoc/compodoc/pull/830) Thanks [Marek Závacký](https://github.com/emzet)
-   feat(routes): support new lazy loading syntax in Angular 8 [#819](https://github.com/compodoc/compodoc/pull/819) Thanks [Adam Stanley](https://github.com/astanley218)

### Bug fixes

-   fix(app): max-search-result in options ([d759b4f](https://github.com/compodoc/compodoc/commit/d759b4f)), closes [#816](https://github.com/compodoc/compodoc/issues/816) Thanks [tzinckgraf](https://github.com/tzinckgraf)
-   fix(app): fix path separator replace on Windows during route processing [#827](https://github.com/compodoc/compodoc/pull/827) Thanks [Adam Stanley](https://github.com/AdamStanley)
-   fix(app): fix unit tests failing on Windows [#826](https://github.com/compodoc/compodoc/pull/826) Thanks [Adam Stanley](https://github.com/AdamStanley)

<a name="1.1.10"></a>

# [1.1.10](https://github.com/compodoc/compodoc/compare/1.1.9...1.1.10) (2019-07-09)

### Features

-   feat(CLI): disableDependencies flag [#798](https://github.com/compodoc/compodoc/pull/798)

### Merged

-   Upgrade to opencollective-postinstall [#804](https://github.com/compodoc/compodoc/pull/804) Thanks [Emanuel](https://github.com/emanuelbuholzer)
-   Update postinstall so that it doesn't cause failures [#758](https://github.com/compodoc/compodoc/pull/758) Thanks [Matt Ezell](https://github.com/mattezell)
-   Avoid pathological out of memory on large datasets [#778](https://github.com/compodoc/compodoc/pull/778) Thanks [Ali Ijaz Sheikh](https://github.com/ofrobots)
-   fix(Engine): Code blocks in Markdown not work as expected [#755](https://github.com/compodoc/compodoc/pull/755) Thanks [José Antonio Yáñez Jiménez](https://github.com/berikin)
-   feat(i18n): Spanish language [#753](https://github.com/compodoc/compodoc/pull/753) Thanks [José Antonio Yáñez Jiménez](https://github.com/berikin)
-   feat(i18n): Italian language [#748](https://github.com/compodoc/compodoc/pull/748) Thanks [Marco](https://github.com/predorock)
-   feat(i18n): add hungarian language [#796](https://github.com/compodoc/compodoc/pull/796) Thanks [Nagy, Gábor](https://github.com/mercury83)
-   feat(i18n): add japanese language translations [#794](https://github.com/compodoc/compodoc/pull/794) Thanks [tkt989](https://github.com/tkt989)
-   feat(i18n): add dutch language translations [#792](https://github.com/compodoc/compodoc/pull/792) Thanks [Bjørn Wikkeling](https://github.com/magikMaker)

### Bug fixes

-   fix(app): toggleMenuItems ([d759b4f](https://github.com/compodoc/compodoc/commit/d759b4f)), closes [#790](https://github.com/compodoc/compodoc/issues/790)
-   fix(app): Code blocks in Markdown not work as expected ([9b829ed](https://github.com/compodoc/compodoc/commit/9b829ed)), closes [#750](https://github.com/compodoc/compodoc/issues/750)
-   fix(export): disableSourceCode flag for json format ([171862d](https://github.com/compodoc/compodoc/commit/171862d)), closes [#785](https://github.com/compodoc/compodoc/issues/785)
-   fix(CLI): rendering with --disableCoverage ([55944ff](https://github.com/compodoc/compodoc/commit/55944ff)), closes [#786](https://github.com/compodoc/compodoc/issues/786)
-   feat(CLI): disableDependencies flag ([399054e](https://github.com/compodoc/compodoc/commit/399054e)), closes [#797](https://github.com/compodoc/compodoc/issues/797)
-   fix(CLI): flag for host url ([b2ec5b9](https://github.com/compodoc/compodoc/commit/b2ec5b9)), closes [#787](https://github.com/compodoc/compodoc/issues/787)
-   fix(CLI): output + serve ([94e2f82](https://github.com/compodoc/compodoc/commit/94e2f82)), closes [#742](https://github.com/compodoc/compodoc/issues/742)
-   fix(CLI): Hide banner in silent mode ([fea00d3](https://github.com/compodoc/compodoc/commit/fea00d3)), closes [#747](https://github.com/compodoc/compodoc/issues/747)

<a name="1.1.9"></a>

# [1.1.9](https://github.com/compodoc/compodoc/compare/1.1.8...1.1.9) (2019-03-01)

### Features

-   feat(app): documentation coverage for files with lint-staged tools ([59ff58e](https://github.com/compodoc/compodoc/commit/59ff58e)), closes [#546](https://github.com/compodoc/compodoc/issues/546)

### Merged

-   fix(UI): a few issues with the src on customLogo img [#688](https://github.com/compodoc/compodoc/pull/688) Thanks [Zachary Feldman](https://github.com/feldmanz66)
-   fix: use consistent semver range specifiers [#733](https://github.com/compodoc/compodoc/pull/733) Thanks [Justin Beckwith](https://github.com/JustinBeckwith)

### Bug fixes

-   fix(app): output + serve ([8332344](https://github.com/compodoc/compodoc/commit/8332344)), closes [#742](https://github.com/compodoc/compodoc/issues/742)
-   fix(deps): jsdoc param comment for accessor ([655be32](https://github.com/compodoc/compodoc/commit/655be32)), closes [#735](https://github.com/compodoc/compodoc/issues/735)
-   fix(deps): injectables inheritance ([35da83e](https://github.com/compodoc/compodoc/commit/35da83e)), closes [#738](https://github.com/compodoc/compodoc/issues/738)
-   fix(deps): no link if ignored data ([242e42d](https://github.com/compodoc/compodoc/commit/242e42d)), closes [#737](https://github.com/compodoc/compodoc/issues/737)
-   fix(deps): multiple inheritance class support ([62f1bd0](https://github.com/compodoc/compodoc/commit/62f1bd0)), closes [#728](https://github.com/compodoc/compodoc/issues/728)
-   fix(deps): Type casting inside decorator ([f597531](https://github.com/compodoc/compodoc/commit/f597531)), closes [#727](https://github.com/compodoc/compodoc/issues/727)

<a name="1.1.8"></a>

# [1.1.8](https://github.com/compodoc/compodoc/compare/1.1.7...1.1.8) (2019-02-08)

### Bug fixes

-   **coverage:** guards, interceptors not in page ([82fe257](https://github.com/compodoc/compodoc/commit/82fe257)), closes [#722](https://github.com/compodoc/compodoc/issues/722)
-   **search:** remove Lunr.js stemmer for indexing ([d73c649](https://github.com/compodoc/compodoc/commit/d73c649)), closes [#619](https://github.com/compodoc/compodoc/issues/619)
-   **deps:** Literal type information for typealias is generated incorrectly ([9db3197](https://github.com/compodoc/compodoc/commit/9db3197)), closes [#711](https://github.com/compodoc/compodoc/issues/711)
-   **app:** disable AnguarJS project WIP support ([2b779a0](https://github.com/compodoc/compodoc/commit/2b779a0)), closes [#667](https://github.com/compodoc/compodoc/issues/667)
-   **menu:** additional menu entries with children collapsed (first level only) ([d6086b4](https://github.com/compodoc/compodoc/commit/d6086b4)), closes [#714](https://github.com/compodoc/compodoc/issues/714)
-   **menu:** error js with custom logo ([e70eded](https://github.com/compodoc/compodoc/commit/e70eded)), closes [#713](https://github.com/compodoc/compodoc/issues/713)
-   **deps:** properties with long arrow function declared ([d5d5e11](https://github.com/compodoc/compodoc/commit/d5d5e11)), closes [#706](https://github.com/compodoc/compodoc/issues/706)
-   **UI:** Inconsistent table formatting for inputs/outputs, method & properties ([01e1167](https://github.com/compodoc/compodoc/commit/01e1167)), closes [#709](https://github.com/compodoc/compodoc/issues/709)
-   **deps:** modules declarations link with global variables ([92949ce](https://github.com/compodoc/compodoc/commit/92949ce)), closes [#710](https://github.com/compodoc/compodoc/issues/710)
-   **deps:** @private and miscellaneous functions ([88e0380](https://github.com/compodoc/compodoc/commit/88e0380)), closes [#671](https://github.com/compodoc/compodoc/issues/671)
-   **deps:** miscellaneous functions return type missing ([1171ea5](https://github.com/compodoc/compodoc/commit/1171ea5)), closes [#700](https://github.com/compodoc/compodoc/issues/700)
-   **CLI:** Wrong version of typescript shown ([e5bcd5e](https://github.com/compodoc/compodoc/commit/e5bcd5e)), closes [#683](https://github.com/compodoc/compodoc/issues/683)

<a name="1.1.7"></a>

# [1.1.7](https://github.com/compodoc/compodoc/compare/1.1.6...1.1.7) (2018-11-27)

### Bug fixes

-   **live-server:** update to fix vulnerability ([f76f80a7](https://github.com/compodoc/compodoc/commit/f76f80a7)), closes [#665](https://github.com/compodoc/compodoc/issues/665) Thanks [Sibiraj](https://github.com/sibiraj-s)
-   **menu:** fr-FR issue during rendering ([a6e4a44b](https://github.com/compodoc/compodoc/commit/a6e4a44b)), closes [#691](https://github.com/compodoc/compodoc/issues/691)

### Features

-   **deps:** symbol support ([079ef44b](https://github.com/compodoc/compodoc/commit/079ef44b)), closes [#694](https://github.com/compodoc/compodoc/issues/694)
-   **modules:** display methods ([23a401ac](https://github.com/compodoc/compodoc/commit/23a401ac)), closes [#340](https://github.com/compodoc/compodoc/issues/340)

<a name="1.1.6"></a>

# [1.1.6](https://github.com/compodoc/compodoc/compare/1.1.5...1.1.6) (2018-10-30)

### Bug fixes

-   **engine:** watch mode ([cc9c887a](https://github.com/compodoc/compodoc/commit/cc9c887a)), closes [#644](https://github.com/compodoc/compodoc/issues/644)
-   **deps:** anonymous function for function argument ([c80504a5](https://github.com/compodoc/compodoc/commit/c80504a5)), closes [#643](https://github.com/compodoc/compodoc/issues/643)
-   **deps:** unnamed function ([a8881b41](https://github.com/compodoc/compodoc/commit/a8881b41)), closes [#668](https://github.com/compodoc/compodoc/issues/668)
-   **engine:** IE11 support ([6d482398](https://github.com/compodoc/compodoc/commit/6d482398)), closes [#673](https://github.com/compodoc/compodoc/issues/673)
-   **deps:** custom syntax in main.ts ([241024b7](https://github.com/compodoc/compodoc/commit/241024b7)), closes [#677](https://github.com/compodoc/compodoc/issues/677)

### Features

-   **UI:** add custom logo to where the title name is located ([f68475b1](https://github.com/compodoc/compodoc/commit/f68475b1)), closes [#134](https://github.com/compodoc/compodoc/issues/134) Thanks [Zach Feldman](https://github.com/feldmanz66)
-   **UI:** Add style url data to component documentation ([bcc0dcf5](https://github.com/compodoc/compodoc/commit/bcc0dcf5)), closes [#648](https://github.com/compodoc/compodoc/issues/648) Thanks [Daniel Leroux](https://github.com/danielleroux)
-   **UI:** decorators arguments listing ([bd23ec89](https://github.com/compodoc/compodoc/commit/bd23ec89)), closes [#630](https://github.com/compodoc/compodoc/issues/630) [#640](https://github.com/compodoc/compodoc/issues/640)
-   **i18n:** pt-BR ([0b366da4](https://github.com/compodoc/compodoc/commit/0b366da4)), Thanks [Laís Figueiredo](https://github.com/lsfgrd)

<a name="1.1.5"></a>

# [1.1.5](https://github.com/compodoc/compodoc/compare/1.1.4...1.1.5) (2018-08-29)

### Bug fixes

-   **overview:** typo in page ([a21f7b98](https://github.com/compodoc/compodoc/commit/a21f7b98))

<a name="1.1.4"></a>

# [1.1.4](https://github.com/compodoc/compodoc/compare/1.1.3...1.1.4) (2018-08-29)

### Features

-   **i18n:** language flag ([9d47e2b4](https://github.com/compodoc/compodoc/commit/9d47e2b4)), closes [#611](https://github.com/compodoc/compodoc/issues/611) Thanks [lichangfeng](https://github.com/lichangfeng)
-   **nest:** Nest projects support ([1a5f5fe3](https://github.com/compodoc/compodoc/commit/1a5f5fe3)), closes [#611](https://github.com/compodoc/compodoc/issues/625)
-   **guard:** support ([0c85e715](https://github.com/compodoc/compodoc/commit/0c85e715)), closes [#578](https://github.com/compodoc/compodoc/issues/578) Thanks [Valentin GOT](https://github.com/ValentinGot)
-   **CLI:** minimal mode ([9c85bcba](https://github.com/compodoc/compodoc/commit/9c85bcba)), closes [#572](https://github.com/compodoc/compodoc/issues/572)
-   **CLI:** disableSearch flag ([0a8efe98](https://github.com/compodoc/compodoc/commit/0a8efe98)), closes [#571](https://github.com/compodoc/compodoc/issues/571)
-   **unit-test:** unit test coverage summary page ([0a1e248b](https://github.com/compodoc/compodoc/commit/0a1e248b)) Thanks [Brigitte Hofmeister](https://github.com/bhofmei)
-   **templates:** override handlebars templates with flag ([e83b126b](https://github.com/compodoc/compodoc/commit/e83b126b)) Thanks [Brigitte Hofmeister](https://github.com/bhofmei)
-   **coverage:** --coverageTestShowOnlyFailed ([3b4e8a5d](https://github.com/compodoc/compodoc/commit/3b4e8a5d)), closes [#606](https://github.com/compodoc/compodoc/issues/606)

### Improvements

-   **menu:** compile the menu as a custom-element to improve performance ([d59761e5](https://github.com/compodoc/compodoc/commit/d59761e5)) Thanks [Wassim CHEGHAM](https://github.com/manekinekko)

### Bug fixes

-   **CLI:** JSON Configuration File JSON Schema ([d8e48d57](https://github.com/compodoc/compodoc/commit/d8e48d57)), closes [#577](https://github.com/compodoc/compodoc/issues/577)
-   **CLI:** handle ../ in includes in tsconfig includes/excludes ([4a445050](https://github.com/compodoc/compodoc/commit/4a445050)), closes [#596](https://github.com/compodoc/compodoc/issues/596)
-   **UI:** Address double scrollbar on example tabs for directive, pipe, and injectable ([81e33988](https://github.com/compodoc/compodoc/commit/81e33988)) Thanks [Blake Simmon](https://github.com/Blakesalot)
-   **UI:** move to ionicons ([f81b42ec](https://github.com/compodoc/compodoc/commit/f81b42ec)), closes [#592](https://github.com/compodoc/compodoc/issues/592)
-   **UI:** Accessors section in top index pages ([aa4a4929](https://github.com/compodoc/compodoc/commit/aa4a4929)), closes [#615](https://github.com/compodoc/compodoc/issues/615)
-   **menu:** overview href is generated twice ([5479515a](https://github.com/compodoc/compodoc/commit/5479515a)), closes [#575](https://github.com/compodoc/compodoc/issues/575)
-   **deps:** barrel file support for import finding strategy ([780c0653](https://github.com/compodoc/compodoc/commit/780c0653)), closes [#566](https://github.com/compodoc/compodoc/issues/556)
-   **deps:** interfaces with custom names ([78c59ea1](https://github.com/compodoc/compodoc/commit/78c59ea1)), closes [#580](https://github.com/compodoc/compodoc/issues/580)
-   **deps:** duplicates for more than 2 files ([bf6e9238](https://github.com/compodoc/compodoc/commit/bf6e9238)), closes [#590](https://github.com/compodoc/compodoc/issues/590)
-   **deps:** Duplicate pages for injectables with custom decorators ([80417826](https://github.com/compodoc/compodoc/commit/80417826)), closes [#591](https://github.com/compodoc/compodoc/issues/591)
-   **deps:** generic support for Map<K, V> ([8f3ef941](https://github.com/compodoc/compodoc/commit/8f3ef941)), closes [#622](https://github.com/compodoc/compodoc/issues/622)
-   **deps:** abstract modifier ([1e6eecba](https://github.com/compodoc/compodoc/commit/1e6eecba)), closes [#626](https://github.com/compodoc/compodoc/issues/626)
-   **graph:** special character in module name ([00075366](https://github.com/compodoc/compodoc/commit/00075366)), closes [#591](https://github.com/compodoc/compodoc/issues/591)

<a name="1.1.3"></a>

# [1.1.3](https://github.com/compodoc/compodoc/compare/1.1.2...1.1.3) (2018-05-16)

### Features

-   **UI:** disableTemplateTab flag ([fed52f1](https://github.com/compodoc/compodoc/commit/fed52f1)), closes [#545](https://github.com/compodoc/compodoc/issues/545)
-   **config:** add config management support with custom file ([bd249fb](https://github.com/compodoc/compodoc/commit/bd249fb)), closes [#379](https://github.com/compodoc/compodoc/issues/379)
-   **UI** Add ability to specify tab ordering and custom tab labels ([e1bdc2e](https://github.com/compodoc/compodoc/commit/e1bdc2e)), closes [#522](https://github.com/compodoc/compodoc/issues/522) Thanks [Blake Simmon](https://github.com/Blakesalot)

### Bug fixes

-   **CLI:** Uniqid for entities between two documentation generation ([1ce6543](https://github.com/compodoc/compodoc/commit/1ce6543)), closes [#550](https://github.com/compodoc/compodoc/issues/550)
-   **CLI:** absolute path with d flag ([f86f11b](https://github.com/compodoc/compodoc/commit/f86f11b)), closes [#559](https://github.com/compodoc/compodoc/issues/559)
-   **CLI:** exclude parser with duplicate file names ([568af47](https://github.com/compodoc/compodoc/commit/568af47)), closes [#551](https://github.com/compodoc/compodoc/issues/551)
-   **CLI:** Using absolute path for -p/--tsconfig ([7d8566c](https://github.com/compodoc/compodoc/commit/7d8566c)), closes [#558](https://github.com/compodoc/compodoc/issues/558)
-   **menu:** Navigation is broken with watch mode ([616e469](https://github.com/compodoc/compodoc/commit/616e469)), closes [#548](https://github.com/compodoc/compodoc/issues/548)
-   **UI:** sort modules import/exports/declarations/providers in ascending order ([9449574](https://github.com/compodoc/compodoc/commit/9449574)), closes [#538](https://github.com/compodoc/compodoc/issues/538)
-   **UI:** back button handling ([b5e16e8](https://github.com/compodoc/compodoc/commit/b5e16e8)), closes [#557](https://github.com/compodoc/compodoc/issues/557)
-   **UI:** additional url + regular entity ([3464b0c](https://github.com/compodoc/compodoc/commit/3464b0c)), closes [#554](https://github.com/compodoc/compodoc/issues/554)
-   **UI:** ensure examples tab has only one scrollbar ([d60b406](https://github.com/compodoc/compodoc/commit/d60b406)), closes [#562](https://github.com/compodoc/compodoc/issues/562) Thanks [Blake Simmon](https://github.com/Blakesalot)
-   **deps:** async functions documented with empty badge ([3049781](https://github.com/compodoc/compodoc/commit/3049781)), closes [#556](https://github.com/compodoc/compodoc/issues/556)
-   **deps:** modules spread elements with global variables ([9576cc6](https://github.com/compodoc/compodoc/commit/9576cc6)), closes [#494](https://github.com/compodoc/compodoc/issues/494)
-   **deps:** Generic array types support ([0ad79de](https://github.com/compodoc/compodoc/commit/0ad79de)), closes [#552](https://github.com/compodoc/compodoc/issues/552)
-   **deps:** generic type parameters for functions ([db9167b](https://github.com/compodoc/compodoc/commit/db9167b)), closes [#555](https://github.com/compodoc/compodoc/issues/555)
-   **deps:** routing with bootstrapModule in if statement ([19109ff](https://github.com/compodoc/compodoc/commit/19109ff)), closes [#560](https://github.com/compodoc/compodoc/issues/560)
-   **deps:** empty @example JSDoc tag ([db48253](https://github.com/compodoc/compodoc/commit/db48253)), closes [#543](https://github.com/compodoc/compodoc/issues/543)
-   **deps:** routes data with function call ([ccc13ce](https://github.com/compodoc/compodoc/commit/ccc13ce)), closes [#525](https://github.com/compodoc/compodoc/issues/525)
-   **deps:** tuples types support ([dc540c5](https://github.com/compodoc/compodoc/commit/dc540c5)), closes [#540](https://github.com/compodoc/compodoc/issues/540)
-   **deps:** extendMerger ([a7448c9](https://github.com/compodoc/compodoc/commit/a7448c9)), closes [#542](https://github.com/compodoc/compodoc/issues/542)
-   **deps:** JSDoc param inside constructor ([c01484c](https://github.com/compodoc/compodoc/commit/c01484c)), closes [#541](https://github.com/compodoc/compodoc/issues/541)
-   **search:** better results display + enable wildcards ([43c6d5d](https://github.com/compodoc/compodoc/commit/43c6d5d)), closes [#537](https://github.com/compodoc/compodoc/issues/537) [#447](https://github.com/compodoc/compodoc/issues/447)
-   **routing:** routes without routing module ([11a742c](https://github.com/compodoc/compodoc/commit/11a742c)), closes [#518](https://github.com/compodoc/compodoc/issues/518) [#488](https://github.com/compodoc/compodoc/issues/488)

<a name="1.1.2"></a>

# [1.1.2](https://github.com/compodoc/compodoc/compare/1.1.1...1.1.2) (2018-04-09)

Performance improvements of pages rendering | +20% in speed generation :tada:

### Features

-   **html-engine:** Split menu rendering for speeding pages rendering ([ab57beed](https://github.com/compodoc/compodoc/commit/ab57beed)), closes [#533](https://github.com/compodoc/compodoc/issues/533)
    Thanks [Wassim Chegham](https://github.com/manekinekko)

### Bug fixes

-   **app:** Handlebars JavaScript heap out of memory ([c8d29167](https://github.com/compodoc/compodoc/commit/c8d29167)), closes [#521](https://github.com/compodoc/compodoc/issues/521)
-   **theme:** correct path if no README in root folder ([78ceab38](https://github.com/compodoc/compodoc/commit/78ceab38)), closes [#524](https://github.com/compodoc/compodoc/issues/524)
-   **dependencies:** coverage for file even with no hostlisteners for example ([c7a32643](https://github.com/compodoc/compodoc/commit/c7a32643)), closes [#527](https://github.com/compodoc/compodoc/issues/527)
-   **dependencies:** --disableLifeCycleHooks with @ignore on component/directive ([eb9fddf2](https://github.com/compodoc/compodoc/commit/eb9fddf2)), closes [#526](https://github.com/compodoc/compodoc/issues/526)
-   **dependencies:** replace callExpressions in routes definitions with text ([2b22fa63](https://github.com/compodoc/compodoc/commit/2b22fa63)), closes [#525](https://github.com/compodoc/compodoc/issues/525) [#467](https://github.com/compodoc/compodoc/issues/467)
-   **dependencies:** module imports forRoot/forChild cleaning ([3e473791](https://github.com/compodoc/compodoc/commit/3e473791)), closes [#531](https://github.com/compodoc/compodoc/issues/531)

<a name="1.1.1"></a>

# [1.1.1](https://github.com/compodoc/compodoc/compare/1.1.0...1.1.1) (2018-03-30)

### Bug fixes

-   **npm:** uuid not in dependencies ([bd1d20](https://github.com/compodoc/compodoc/commit/bd1d20)), closes [#523](https://github.com/compodoc/compodoc/issues/523)

<a name="1.1.0"></a>

# [1.1.0](https://github.com/compodoc/compodoc/compare/1.0.9...1.1.0) (2018-03-30)

**Main feature :**

New menu organisation : components, directives or injectables of a module are displayed directly in the module menu entry

**Main structural change :**

Drop direct TypeScript dependency, Compodoc now relies on ts-simple-ast TypeScript dependency.

### Features

-   **UI:** Component, directive, pipe and injectable not linked inside a module should appear in the menu alone ([b0106382](https://github.com/compodoc/compodoc/commit/b0106382)), closes [#510](https://github.com/compodoc/compodoc/issues/510)
-   **UI:** Display filename in index of miscellaneous ([4ddeda4f](https://github.com/compodoc/compodoc/commit/4ddeda4f)), closes [#520](https://github.com/compodoc/compodoc/issues/520)
-   **CLI:** disableDomTree option ([c71ca965](https://github.com/compodoc/compodoc/commit/c71ca965)), closes [#517](https://github.com/compodoc/compodoc/issues/517)

### Bug Fixes

-   **UI:** group components, directives, injectables, pipes based on module ([46cbb07a](https://github.com/compodoc/compodoc/commit/46cbb07a)), closes [#145](https://github.com/compodoc/compodoc/issues/145) [#258](https://github.com/compodoc/compodoc/issues/258)
-   **UI:** Dependency-Link not shown in side-nav if no dependencies and peerDependencies ([5ffe9d22](https://github.com/compodoc/compodoc/commit/5ffe9d22)), closes [#506](https://github.com/compodoc/compodoc/issues/506)
-   **dependencies:** return's comment of method is missing ([05cd3a4c](https://github.com/compodoc/compodoc/commit/05cd3a4c)), closes [#512](https://github.com/compodoc/compodoc/issues/512)
-   **dependencies:** Display component providers ([78045092](https://github.com/compodoc/compodoc/commit/78045092)), closes [#514](https://github.com/compodoc/compodoc/issues/514)
-   **dependencies:** component inheritance with simple base class + disabledLifeCycleHooks support ([bd940053](https://github.com/compodoc/compodoc/commit/bd940053)), closes [#505](https://github.com/compodoc/compodoc/issues/505)
-   **dependencies:** support entity with same name ([01ac07a3](https://github.com/compodoc/compodoc/commit/01ac07a3)), closes [#474](https://github.com/compodoc/compodoc/issues/474) [#233](https://github.com/compodoc/compodoc/issues/233)

<a name="1.0.9"></a>

# [1.0.9](https://github.com/compodoc/compodoc/compare/1.0.8...1.0.9) (2018-03-09)

### Features

-   **dependencies:** display peer dependencies in dependencies page ([eece547f](https://github.com/compodoc/compodoc/commit/eece547f)), closes [#478](https://github.com/compodoc/compodoc/issues/478)
-   **dependencies:** inheritance support for components and classes ([b94e9c75](https://github.com/compodoc/compodoc/commit/b94e9c75)), closes [#324](https://github.com/compodoc/compodoc/issues/324) [#152](https://github.com/compodoc/compodoc/issues/152)
-   **dependencies:** @ignore JSDoc tag support ([98326bdf](https://github.com/compodoc/compodoc/commit/98326bdf)), closes [#486](https://github.com/compodoc/compodoc/issues/486)
-   **UI:** Link to code line issue with multiple code blocks ([aec0014a](https://github.com/compodoc/compodoc/commit/aec0014a)), closes [#466](https://github.com/compodoc/compodoc/issues/466)

### Bug Fixes

-   **dependencies:** Optional methods/property for TS interfaces/classes ([a3ce87fc](https://github.com/compodoc/compodoc/commit/a3ce87fc)), closes [#484](https://github.com/compodoc/compodoc/issues/484)
-   **dependencies:** union types with array ([9b0be6dd](https://github.com/compodoc/compodoc/commit/9b0be6dd)), closes [#496](https://github.com/compodoc/compodoc/issues/496)
-   **dependencies:** union types with generics ([eec9c4be](https://github.com/compodoc/compodoc/commit/eec9c4be)), closes [#501](https://github.com/compodoc/compodoc/issues/501)
-   **additional:** external docs change sorting ([646d7ecc](https://github.com/compodoc/compodoc/commit/646d7ecc)), closes [#471](https://github.com/compodoc/compodoc/issues/471) [#482](https://github.com/compodoc/compodoc/issues/482)
-   **dependencies:** multiple union types with array ([182a1593](https://github.com/compodoc/compodoc/commit/182a1593)), closes [#498](https://github.com/compodoc/compodoc/issues/498) [#499](https://github.com/compodoc/compodoc/issues/499)

<a name="1.0.8"></a>

# [1.0.8](https://github.com/compodoc/compodoc/compare/1.0.7...1.0.8) (2018-03-01)

### Features

-   **routing:** option to disable routes graph ([62073b](https://github.com/compodoc/compodoc/commit/62073b)), closes [#472](https://github.com/compodoc/compodoc/issues/472) [#485](https://github.com/compodoc/compodoc/issues/485)

### Bug Fixes

-   **jsdoc:** @link for external url broken ([6775ef](https://github.com/compodoc/compodoc/commit/6775ef)), closes [#305](https://github.com/compodoc/compodoc/issues/305)

<a name="1.0.7"></a>

# [1.0.7](https://github.com/compodoc/compodoc/compare/1.0.6...1.0.7) (2018-02-15)

### Bug Fixes

-   **accessors:** Accessors not parsing all data correctly ([80af63b](https://github.com/compodoc/compodoc/commit/80af63b)), closes [#468](https://github.com/compodoc/compodoc/issues/468)
-   **routing:** Routes not scanned for Node.js 7 & 6 ([9435422](https://github.com/compodoc/compodoc/commit/9435422)), closes [#463](https://github.com/compodoc/compodoc/issues/463)
-   **templates:** hide cells for function parameters if field is empty ([5d32cbb](https://github.com/compodoc/compodoc/commit/5d32cbb)), closes [#464](https://github.com/compodoc/compodoc/issues/464)

<a name="1.0.6"></a>

# [1.0.6](https://github.com/compodoc/compodoc/compare/1.0.5...1.0.6) (2018-02-12)

### Features

-   **prism:** Added SCSS support for code blocks ([2b983cc](https://github.com/compodoc/compodoc/commit/2b983cc)), closes [#398](https://github.com/compodoc/compodoc/issues/398)
    Thanks [Martin Hobert](https://github.com/Epenance)
-   **additional-doc:** prepareExternalIncludes parses children recursively ([51aeae2](https://github.com/compodoc/compodoc/commit/51aeae24a03c0287ca68cadf317294c5422c4fc7))
    Thanks [jabiinfante](https://github.com/jabiinfante)
-   **example-tab:** Added examples tab to services ([687b04c](https://github.com/compodoc/compodoc/commit/687b04ccc79521684063ebfc4c3d1f32956ec20c))
    Thanks [rprotsyk](https://github.com/rprotsyk)
-   **core:** downgrade TypeScript version ([fa74be9](https://github.com/compodoc/compodoc/commit/fa74be96ffdeaa383b98d8708f0311edbf5b4640)), closes [#359](https://github.com/compodoc/compodoc/issues/359)
-   **core:** display project dependencies ([c7a7689](https://github.com/compodoc/compodoc/commit/15ce12c8fcc7a768960f7329800f449a5d08e64e5d0ad0744347be929865a21a8131ab035e8c80ae)), closes [#441](https://github.com/compodoc/compodoc/issues/441)
-   **theme:** Support Google Analytics ([f126115](https://github.com/compodoc/compodoc/commit/f126115763246c399e682ae79158ef0314395716)), closes [#461](https://github.com/compodoc/compodoc/issues/461)
-   **theme:** Material design theme ([d3f1730](https://github.com/compodoc/compodoc/commit/d3f17301f92936932dabf2cc5d9bc24100faeb4e)), closes [#418](https://github.com/compodoc/compodoc/issues/418)
-   **coverage:** --coverageTestThresholdFail ([f79f280](https://github.com/compodoc/compodoc/commit/f79f280115abb66874e9bc707fab15f68d1bf114)), closes [#428](https://github.com/compodoc/compodoc/issues/428)

### Bug Fixes

-   **cli:** display error message for empty -p ([6747725](https://github.com/compodoc/compodoc/commit/674772504abdc0984dce43de4b8b054fe9ac32e0)), closes [#422](https://github.com/compodoc/compodoc/issues/422)
-   **cli:** remove duplicate code ([eb25e1a](https://github.com/compodoc/compodoc/commit/eb25e1a5fe4650e69f3b2e90c66a1280ee217ccf))
    Thanks [Alan Agius](https://github.com/alan-agius4)
-   **dependencies:** Error if HTTP_INTERCEPTORS registered via providers ([89c3335](https://github.com/compodoc/compodoc/commit/89c333555b8b6a07fea9ec3a2e1cabf3d7da13a5)), closes [#456](https://github.com/compodoc/compodoc/issues/456)
-   **dependencies:** show default values for function parameters ([163dc69](https://github.com/compodoc/compodoc/commit/163dc693b8dfd09671cd10e44de7cfa56237f574)), closes [#453](https://github.com/compodoc/compodoc/issues/453)
-   **dependencies:** private modifier for constructor ([016f963](https://github.com/compodoc/compodoc/commit/016f96386a209c4d01214b3e2f93193d7d1db587)), closes [#458](https://github.com/compodoc/compodoc/issues/458)
-   **dependencies:** optional for interfaces ([5e0845e](https://github.com/compodoc/compodoc/commit/5e0845ecbb3ebad3037bbd81bb05015132d78945)), closes [#455](https://github.com/compodoc/compodoc/issues/455)
-   **dependencies:** detect type annotation based on default values ([c80d155](https://github.com/compodoc/compodoc/commit/c80d15519e8bfa07625ba72f11f8771ef07308ee)), closes [#419](https://github.com/compodoc/compodoc/issues/419)
-   **dependencies:** optional field in parameter table could be yes or no ([96f3a0b](https://github.com/compodoc/compodoc/commit/96f3a0b1c9d3d00fde7a21afddde525619c4a39b)), closes [#420](https://github.com/compodoc/compodoc/issues/420)
-   **dependencies:** @link to all miscellaneous ([0194c1b](https://github.com/compodoc/compodoc/commit/0194c1b78cb64b6f6b705e3af4072698f21d8f34)), closes [#416](https://github.com/compodoc/compodoc/issues/416)
-   **dependencies:** shorthand metadatas support for components/directives ([295a029](https://github.com/compodoc/compodoc/commit/295a029e69011ab8346dd12be7284809291d1638)), closes [#407](https://github.com/compodoc/compodoc/issues/407)
-   **dependencies:** useExisting support for interceptors ([7c8794a](https://github.com/compodoc/compodoc/commit/7c8794a)), closes [#406](https://github.com/compodoc/compodoc/issues/406)
-   **search:** prevent lunr call stack size exceeded for huge file ([f495cd](https://github.com/compodoc/compodoc/commit/f495cd)), closes [#410](https://github.com/compodoc/compodoc/issues/410) [#378](https://github.com/compodoc/compodoc/issues/378)
-   **core:** add package-lock.json ([15ce12c](https://github.com/compodoc/compodoc/commit/15ce12c8fc47be929865a21a8131ab035e8c80ae)), closes [#413](https://github.com/compodoc/compodoc/issues/413)
-   **core:** rollback to marked ([c5eb16](https://github.com/compodoc/compodoc/commit/c5eb16d99057bdbfdf7c134b3613d8d0266c882d)), closes [#349](https://github.com/compodoc/compodoc/issues/349)
-   **core:** bump dependencies ([99be400](https://github.com/compodoc/compodoc/commit/99be40081ce51bd636ef38eb4b21788621f09e70)), closes [#430](https://github.com/compodoc/compodoc/issues/430)
-   **routing:** spread & dynamic value first support ([47fd133](https://github.com/compodoc/compodoc/commit/47fd133136903efe2f4148b93cafc53fd104e92c)), closes [#452](https://github.com/compodoc/compodoc/issues/452)
-   **routing:** recursive dynamic variable support ([5a98b56](https://github.com/compodoc/compodoc/commit/5a98b56e15da9040d5bdac967408f49a526b46bc)), closes [#417](https://github.com/compodoc/compodoc/issues/417) [#400](https://github.com/compodoc/compodoc/issues/400) [#394](https://github.com/compodoc/compodoc/issues/394) [#361](https://github.com/compodoc/compodoc/issues/361) [#364](https://github.com/compodoc/compodoc/issues/364) [#459](https://github.com/compodoc/compodoc/issues/459)
-   **routing:** support for ModuleWithProviders definition ([dbdb6a6](https://github.com/compodoc/compodoc/commit/dbdb6a61736cc97943fd5ea22ed20be5c4228974)), closes [#257](https://github.com/compodoc/compodoc/issues/257)
-   **routing:** scan also static value in class ([26dd154](https://github.com/compodoc/compodoc/commit/26dd154de242796737bbb2239c5b4e4e9e2e4bf2)), closes [#394](https://github.com/compodoc/compodoc/issues/394)
-   **coverage:** src folder not parsed ([7b32ac6](https://github.com/compodoc/compodoc/commit/7b32ac67debe9fc90047db4fd4a285336d3391d5)), closes [#431](https://github.com/compodoc/compodoc/issues/431)
-   **template:** Removed relative URL helper function from logo img tag ([3f18d0c](https://github.com/compodoc/compodoc/commit/3f18d0c7f51054f8d2c962a782e1dfdf0207d061))
    Thanks [ainsleybc](https://github.com/ainsleybc)
-   **template:** Fixing ordered lists in README.md files ([bf22787](https://github.com/compodoc/compodoc/commit/bf227874266a1e29647128f061dc099ab8ae3c21)), closes [#435](https://github.com/compodoc/compodoc/issues/435)
    Thanks [Michael Letcher](https://github.com/michael-letcher)

<a name="1.0.5"></a>

# [1.0.5](https://github.com/compodoc/compodoc/compare/1.0.4...1.0.5) (2017-12-02)

### Features

-   **code-highlightning:** copy button ([15ad139d](https://github.com/compodoc/compodoc/commit/15ad139d)), closes [#373](https://github.com/compodoc/compodoc/issues/373)
-   **dependencies:** entryComponents support for modules ([4774f9e3](https://github.com/compodoc/compodoc/commit/4774f9e3))

### Bug Fixes

-   **dependencies:** accessors documentation ([84857c2b](https://github.com/compodoc/compodoc/commit/84857c2b)), closes [#393](https://github.com/compodoc/compodoc/issues/393)
-   **dependencies:** function parameter undefined in Miscellaneous - Functions ([e29a56c8](https://github.com/compodoc/compodoc/commit/e29a56c8)), closes [#389](https://github.com/compodoc/compodoc/issues/389)
-   **dependencies:** Empty description for accessors ([45181513](https://github.com/compodoc/compodoc/commit/45181513)), closes [#385](https://github.com/compodoc/compodoc/issues/385)
-   **dependencies:** wrong generated links of module declarations ([ab1af5b0](https://github.com/compodoc/compodoc/commit/ab1af5b0)), closes [#372](https://github.com/compodoc/compodoc/issues/372)
-   **dependencies:** Dom tree tab - component with inline template ([9ff83a90](https://github.com/compodoc/compodoc/commit/9ff83a90)), closes [#370](https://github.com/compodoc/compodoc/issues/370)
-   **dependencies:** static modifier ([6cd80868](https://github.com/compodoc/compodoc/commit/6cd80868)), closes [#367](https://github.com/compodoc/compodoc/issues/367)
-   **dependencies:** disableLifeCycleHooks ignored for Directives ([c2b5f75f](https://github.com/compodoc/compodoc/commit/c2b5f75f)), closes [#363](https://github.com/compodoc/compodoc/issues/363)
-   **dependencies:** dynamic import support for path and pathMatch routes definition ([633ea2f8](https://github.com/compodoc/compodoc/commit/633ea2f8)), closes [#216](https://github.com/compodoc/compodoc/issues/216)
-   **tabs:** conflict with readme titles ([230d96a6](https://github.com/compodoc/compodoc/commit/230d96a6)), closes [#381](https://github.com/compodoc/compodoc/issues/381)
-   **links:** the generated href to angular api doc is wrong ([153b38d9](https://github.com/compodoc/compodoc/commit/153b38d9)), closes [#368](https://github.com/compodoc/compodoc/issues/368)
-   **markdown:** image tag not correctly closed ([43c86a17](https://github.com/compodoc/compodoc/commit/43c86a17)), closes [#384](https://github.com/compodoc/compodoc/issues/384)
-   **coverage:** add misc functions and variables ([04e0c038](https://github.com/compodoc/compodoc/commit/04e0c038)), closes [#388](https://github.com/compodoc/compodoc/issues/388)
-   **routes:** support for outlet dynamic imports, + enums ([d3b9b9e9](https://github.com/compodoc/compodoc/commit/d3b9b9e9)), closes [#394](https://github.com/compodoc/compodoc/issues/394)
-   **core:** typescript errors ([96426902](https://github.com/compodoc/compodoc/commit/96426902)), closes [#369](https://github.com/compodoc/compodoc/issues/369)
    Thanks [daniel.preussner](https://github.com/dp-1a)

<a name="1.0.4"></a>

# [1.0.4](https://github.com/compodoc/compodoc/compare/1.0.3...1.0.4) (2017-11-07)

### Features

-   **pipes:** add metadata + functions and properties ([7ccb04b2](https://github.com/compodoc/compodoc/commit/7ccb04b2)), closes [#336](https://github.com/compodoc/compodoc/issues/336)
-   **export:** beautify formats JSON output ([562455ab](https://github.com/compodoc/compodoc/commit/562455ab)) thanks [realappie](https://github.com/realappie)
-   **cli:** Add support for specifying a favicon ([8cfe576f](https://github.com/compodoc/compodoc/commit/8cfe576f)), closes [#310](https://github.com/compodoc/compodoc/issues/310)
-   **dependencies:** interceptors support ([7efd812e](https://github.com/compodoc/compodoc/commit/7efd812e)), closes [#334](https://github.com/compodoc/compodoc/issues/334)

### Bug Fixes

-   **dependencies:** decorators metadatas resolve with imports ([a5a3027c](https://github.com/compodoc/compodoc/commit/a5a3027c)), closes [#94](https://github.com/compodoc/compodoc/issues/94)
-   **dependencies:** spread operator support for module metadatas ([8e098086](https://github.com/compodoc/compodoc/commit/8e098086)), closes [#298](https://github.com/compodoc/compodoc/issues/298)
-   **core:** split disablePrivateOrInternalSupport ([9e4222ed](https://github.com/compodoc/compodoc/commit/9e4222ed)), closes [#241](https://github.com/compodoc/compodoc/issues/241) [#271](https://github.com/compodoc/compodoc/issues/271)

<a name="1.0.3"></a>

# [1.0.3](https://github.com/compodoc/compodoc/compare/1.0.2...1.0.3) (2017-10-31)

### Features

-   **generation:** return a Promise ([2792967](https://github.com/compodoc/compodoc/commit/2792967)), closes [#4](https://github.com/compodoc/gulp-compodoc/issues/4)

### Bug Fixes

-   **configuration:** missing properties ([c55d2496](https://github.com/compodoc/compodoc/commit/c55d2496))
-   **process:** correct listening of unhandledRejection & uncaughtException ([a0c4f688](https://github.com/compodoc/compodoc/commit/a0c4f688))

<a name="1.0.2"></a>

# [1.0.2](https://github.com/compodoc/compodoc/compare/1.0.1...1.0.2) (2017-10-30)

**Main features :**

-   export option : json and html, pdf coming soon
-   es6 accessors support

### Features

-   **coverage:** per-file minimum coverage ([185465eb](https://github.com/compodoc/compodoc/commit/185465eb)), closes [#306](https://github.com/compodoc/compodoc/issues/306)
-   **dependencies:** accessors support ([bed46c93](https://github.com/compodoc/compodoc/commit/bed46c93)), closes [#274](https://github.com/compodoc/compodoc/issues/274)
-   **app:** export option ([93df1075](https://github.com/compodoc/compodoc/commit/93df1075)), closes [#196](https://github.com/compodoc/compodoc/issues/196)
-   **module:** graph fullscreen button
    ([8161ea40](https://github.com/compodoc/compodoc/commit/8161ea40)), closes [#337](https://github.com/compodoc/compodoc/issues/337)

### Bug Fixes

-   **interface:** fix relative link for properties ([4751f602](https://github.com/compodoc/compodoc/commit/4751f602)), closes [#311](https://github.com/compodoc/compodoc/issues/311)
-   **menu:** URLs for CHANGELOG, CONTRIBUTING, LICENSE in pages with depth = 1 ([8de9a9f3](https://github.com/compodoc/compodoc/commit/8de9a9f3)), closes [#328](https://github.com/compodoc/compodoc/issues/328)
-   **dependencies:** handling QualifiedName types ex: Highcharts.Options ([6bdd6345](https://github.com/compodoc/compodoc/commit/6bdd6345)), closes [#335](https://github.com/compodoc/compodoc/issues/335)
-   **coverage:** correctly ignore private members
    ([19d8e5c2](https://github.com/compodoc/compodoc/commit/19d8e5c2)), closes [#332](https://github.com/compodoc/compodoc/issues/332)
-   **dependencies:** namespace support
    ([46e3601f](https://github.com/compodoc/compodoc/commit/46e3601f)), closes [#341](https://github.com/compodoc/compodoc/issues/341)
-   **cli:** use tsconfig include attribute
    ([69fa771c](https://github.com/compodoc/compodoc/commit/69fa771c)), closes [#307](https://github.com/compodoc/compodoc/issues/307)
-   **coverage:** restore very-good status
    ([37d1965c](https://github.com/compodoc/compodoc/commit/37d1965c)), closes [#309](https://github.com/compodoc/compodoc/issues/309)

<a name="1.0.1"></a>

# [1.0.1](https://github.com/compodoc/compodoc/compare/1.0.0-beta.15...1.0.1) (2017-09-08)

Stopping beta period. The release cycle will be more quicker than before, when between 5 to 10 bugs are ready to ship, i will submit a new patch version.

### Features

-   **coverage:** Sort coverage table ([30923878](https://github.com/compodoc/compodoc/commit/30923878)), closes [#292](https://github.com/compodoc/compodoc/issues/292)
-   **link:** anchor support for @link ([d9b75567](https://github.com/compodoc/compodoc/commit/d9b75567)), closes [#211](https://github.com/compodoc/compodoc/issues/211)
-   **pages:** anchor for name of variables and functions ([d9869a6f](https://github.com/compodoc/compodoc/commit/d9869a6f))

### Bug Fixes

-   **deps:** support self-defined type ([104b82fa](https://github.com/compodoc/compodoc/commit/104b82fa)), closes [#267](https://github.com/compodoc/compodoc/issues/267)
-   **deps:** Array of custom interface not showing in documentation ([469f0945](https://github.com/compodoc/compodoc/commit/469f0945)), closes [#300](https://github.com/compodoc/compodoc/issues/300)
-   **deps:** decorator with simple argument string ([8eb13c52](https://github.com/compodoc/compodoc/commit/8eb13c52)), closes [#299](https://github.com/compodoc/compodoc/issues/299)
-   **doc:** links to Angular documentation for modules import, export etc ([b9b9d419](https://github.com/compodoc/compodoc/commit/b9b9d419)), closes [#297](https://github.com/compodoc/compodoc/issues/297)

<a name="1.0.0-beta.15"></a>

# [1.0.0-beta.15](https://github.com/compodoc/compodoc/compare/1.0.0-beta.14...1.0.0-beta.15) (2017-09-04)

## Changes

-   main graph for huge projects with more than 200 modules is disabled, and viz.js error catched.
-   @HostBinding & @HostListener support

### Features

-   **deps:** optional support for parameter ([5bcef12](https://github.com/compodoc/compodoc/commit/5bcef12)), closes [#288](https://github.com/compodoc/compodoc/issues/288)
-   **app:** [@HostBinding](https://github.com/HostBinding) & [@HostListener](https://github.com/HostListener) support ([1ab4311](https://github.com/compodoc/compodoc/commit/1ab4311)), closes [#277](https://github.com/compodoc/compodoc/issues/277)
-   **misc:** Linking directly to correct enumeration, variable etc ([902c8f2](https://github.com/compodoc/compodoc/commit/902c8f2)), closes [#278](https://github.com/compodoc/compodoc/issues/278)

### Bug Fixes

-   **symbols:** lock icon just for private or protected ([884eb9f](https://github.com/compodoc/compodoc/commit/884eb9f)), closes [#291](https://github.com/compodoc/compodoc/issues/291)
-   **deps:** invalid provider config ([77cc525](https://github.com/compodoc/compodoc/commit/77cc525)), closes [#293](https://github.com/compodoc/compodoc/issues/293)
-   **deps:** extends for interfaces ([8ba84a8](https://github.com/compodoc/compodoc/commit/8ba84a8)), closes [#281](https://github.com/compodoc/compodoc/issues/281)
-   **graph:** Not able to generate graph on large projects ([9ee7775](https://github.com/compodoc/compodoc/commit/9ee7775)), closes [#283](https://github.com/compodoc/compodoc/issues/283)
-   **output:** absolute path in cwd ([97953e3](https://github.com/compodoc/compodoc/commit/97953e3)), closes [#279](https://github.com/compodoc/compodoc/issues/279)
-   **deps:** return with union type & null ([b7d3406](https://github.com/compodoc/compodoc/commit/b7d3406)), closes [#287](https://github.com/compodoc/compodoc/issues/287)
-   **deps:** JSDoc tag for property in constructor ([b8965f6](https://github.com/compodoc/compodoc/commit/b8965f6)), closes [#286](https://github.com/compodoc/compodoc/issues/286)
-   **deps:** support typealias with LiteralType ([8c284e7](https://github.com/compodoc/compodoc/commit/8c284e7)), closes [#285](https://github.com/compodoc/compodoc/issues/285)
-   **cli:** Error with watch flag ([ae727ec](https://github.com/compodoc/compodoc/commit/ae727ec)), closes [#284](https://github.com/compodoc/compodoc/issues/284)
-   **deps:** support class with custom decorator ([059b3c9](https://github.com/compodoc/compodoc/commit/059b3c9)), closes [#245](https://github.com/compodoc/compodoc/issues/245)

<a name="1.0.0-beta.14"></a>

# [1.0.0-beta.14](https://github.com/compodoc/compodoc/compare/1.0.0-beta.13...1.0.0-beta.14) (2017-08-11)

## Changes

-   main graph for huge projects with more than 200 modules is disabled
-   index for functions, variables, inputs etc
-   speed parsing for huge projects

### Bug Fixes

-   **additional-doc:** incorrect filenames in additional-documentation ([68f80c60](https://github.com/compodoc/compodoc/commit/68f80c60)), closes [#228](https://github.com/compodoc/compodoc/issues/228)
-   **chore:** -d + absolute folder ([2830c086](https://github.com/compodoc/compodoc/commit/2830c086)), closes [#235](https://github.com/compodoc/compodoc/issues/235)
-   **modules:** Empty NgModule produce an empty graph ([d6d8388b](https://github.com/compodoc/compodoc/commit/d6d8388b)), closes [#236](https://github.com/compodoc/compodoc/issues/236)
-   **routes:** iOS 8 routes graph rendering - innerHTML + SVG ([128d33a1](https://github.com/compodoc/compodoc/commit/128d33a1)), closes [#229](https://github.com/compodoc/compodoc/issues/229)
-   **links:** Url for @link is not always right ([6be60bcb](https://github.com/compodoc/compodoc/commit/6be60bcb)), closes [#237](https://github.com/compodoc/compodoc/issues/237)
-   **links:** Wrong URL generated for inline {@link} doc in constructor ([73285b51](https://github.com/compodoc/compodoc/commit/73285b51)), closes [#264](https://github.com/compodoc/compodoc/issues/264)
-   **graph:** render again in sequence ([75ea0c96](https://github.com/compodoc/compodoc/commit/75ea0c96)), closes [#238](https://github.com/compodoc/compodoc/issues/238)
-   **routes:** Routes page not working with null route ([a62e7487](https://github.com/compodoc/compodoc/commit/a62e7487)), closes [#201](https://github.com/compodoc/compodoc/issues/201)
-   **parsing:** files scanning rewritten, huge main graph disabled ([cd03eddf](https://github.com/compodoc/compodoc/commit/cd03eddf)), closes [#226](https://github.com/compodoc/compodoc/issues/226) [#231](https://github.com/compodoc/compodoc/issues/231)
-   **overview:** don't display empty graph if no modules ([8c1ffe3b](https://github.com/compodoc/compodoc/commit/8c1ffe3b))
-   **markdown:** Images in README rendered in block ([7c695473](https://github.com/compodoc/compodoc/commit/7c695473)), closes [#261](https://github.com/compodoc/compodoc/issues/261)
-   **opts:** disablePrivateOrInternalSupport public methods in component ([a897a191](https://github.com/compodoc/compodoc/commit/a897a191)), closes [#265](https://github.com/compodoc/compodoc/issues/265)
-   **templates:** html tag bcode not balanced ([8d96a5aa](https://github.com/compodoc/compodoc/commit/8d96a5aa)), closes [#276](https://github.com/compodoc/compodoc/issues/276)
-   **deps:** UTF8-BOM parsing ([3f4707cb](https://github.com/compodoc/compodoc/commit/3f4707cb)), closes [#230](https://github.com/compodoc/compodoc/issues/230)
-   **deps:** live-server issue with Node.js 8 ([38710eaa](https://github.com/compodoc/compodoc/commit/38710eaa)), closes [#232](https://github.com/compodoc/compodoc/issues/232)
-   **deps:** empty module decorator ([00889ab6](https://github.com/compodoc/compodoc/commit/00889ab6)), closes [#248](https://github.com/compodoc/compodoc/issues/248)
-   **deps:** component @param missing in the generated documentation ([5b94056d](https://github.com/compodoc/compodoc/commit/5b94056d)), closes [#225](https://github.com/compodoc/compodoc/issues/225)
-   **deps:** @example for functions ([6b3f262c](https://github.com/compodoc/compodoc/commit/6b3f262c)), closes [#253](https://github.com/compodoc/compodoc/issues/253)
-   **deps:** c-style typed arrays support ([91f23f38](https://github.com/compodoc/compodoc/commit/91f23f38)), closes [#256](https://github.com/compodoc/compodoc/issues/256)
-   **deps:** indexable for class ([a12c120f](https://github.com/compodoc/compodoc/commit/a12c120f)), closes [#255](https://github.com/compodoc/compodoc/issues/255)
-   **deps:** coverage and constructor properties ([0653fb23](https://github.com/compodoc/compodoc/commit/0653fb23)), closes [#259](https://github.com/compodoc/compodoc/issues/259)
-   **deps:** inherit return type ([d468ee8d](https://github.com/compodoc/compodoc/commit/d468ee8d)), closes [#268](https://github.com/compodoc/compodoc/issues/268)
-   **deps:** support class with custom decorator ([059b3c9e](https://github.com/compodoc/compodoc/commit/059b3c9e)), closes [#245](https://github.com/compodoc/compodoc/issues/245)

### Features

-   **app:** display link to MDN or TypeScript doc for basic types ([1cfa58e2](https://github.com/compodoc/compodoc/commit/1cfa58e2))
-   **app:** better params display ([0fb9e93c](https://github.com/compodoc/compodoc/commit/0fb9e93c))
-   **deps:** support of function type parameter ([e8b1c0fd](https://github.com/compodoc/compodoc/commit/e8b1c0fd))
-   **deps:** link to enums, split misc pages ([37ec7ba4](https://github.com/compodoc/compodoc/commit/37ec7ba4)), closes [#266](https://github.com/compodoc/compodoc/issues/266)
-   **deps:** @internal for main class decorator ([bafc1878](https://github.com/compodoc/compodoc/commit/bafc1878)), closes [#262](https://github.com/compodoc/compodoc/issues/262)
-   **deps:** Override JSDOC params types with TypeScript ones ([7492c45a](https://github.com/compodoc/compodoc/commit/7492c45a)), closes [#254](https://github.com/compodoc/compodoc/issues/254)

<a name="1.0.0-beta.13"></a>

# [1.0.0-beta.13](https://github.com/compodoc/compodoc/compare/1.0.0-beta.12...1.0.0-beta.13) (2017-07-15)

### Bug Fixes

-   **deps:** Resolve array declaration in modules ([619842d](https://github.com/compodoc/compodoc/commit/619842d)), closes [#210](https://github.com/compodoc/compodoc/issues/210) [#15](https://github.com/compodoc/compodoc/issues/15)
-   **routes:** Routes names required to be unique ([7f17ecb](https://github.com/compodoc/compodoc/commit/7f17ecb)), closes [#193](https://github.com/compodoc/compodoc/issues/193)
-   **deps:** RangeError: Invalid array length / @input/@output parsing ([048fd20](https://github.com/compodoc/compodoc/commit/048fd20)), closes [#209](https://github.com/compodoc/compodoc/issues/209)
-   **html:** Type in "Infos" tab - should be "Info" ([1ceee52](https://github.com/compodoc/compodoc/commit/1ceee52)), closes [#224](https://github.com/compodoc/compodoc/issues/224)
-   **html:** Source code not rendered ([bfe4708](https://github.com/compodoc/compodoc/commit/bfe4708)), closes [#223](https://github.com/compodoc/compodoc/issues/223)

### Features

-   **chore:** Add an interactive examples tab ([34de4f0](https://github.com/compodoc/compodoc/commit/34de4f0)), closes [#188](https://github.com/compodoc/compodoc/issues/188) Thanks rprotsyk.
-   **doc:** support to display the changelog.md, contributing, license, todo ([272a0ad](https://github.com/compodoc/compodoc/commit/272a0ad)), closes [#215](https://github.com/compodoc/compodoc/issues/215)
-   **watch:** Watch README.md, and other root markdown files ([ed05424](https://github.com/compodoc/compodoc/commit/ed05424)), closes [#221](https://github.com/compodoc/compodoc/issues/221)
-   **chore:** Markdown file support for modules, services, etc ([918a521](https://github.com/compodoc/compodoc/commit/918a521)), closes [#204](https://github.com/compodoc/compodoc/issues/204)

<a name="1.0.0-beta.12"></a>

# [1.0.0-beta.12](https://github.com/compodoc/compodoc/compare/1.0.0-beta.11...1.0.0-beta.12) (2017-07-09)

### Bug Fixes

-   **chore:** Cannot find module 'json5' ([04fb75f](https://github.com/compodoc/compodoc/commit/04fb75f)), closes [#219](https://github.com/compodoc/compodoc/issues/219)
-   **dependencies:** All types display in the doc as void (incorrect types) ([c586b32](https://github.com/compodoc/compodoc/commit/c586b32)), closes [#218](https://github.com/compodoc/compodoc/issues/218)

<a name="1.0.0-beta.11"></a>

# [1.0.0-beta.11](https://github.com/compodoc/compodoc/compare/1.0.0-beta.10...1.0.0-beta.11) (2017-07-08)

### Bug Fixes

-   **options:** Link correct options with CLI flags ([82af585](https://github.com/compodoc/compodoc/commit/82af585)), closes [#205](https://github.com/compodoc/compodoc/issues/205)
-   **watch:** Watch mode not working properly ([4264b5e](https://github.com/compodoc/compodoc/commit/4264b5e)), closes [#141](https://github.com/compodoc/compodoc/issues/141)
-   **search-engine:** Invalid JSON is creating an issue when rendering the object to the template ([8042af5](https://github.com/compodoc/compodoc/commit/8042af5)), closes [#187](https://github.com/compodoc/compodoc/issues/187)
-   **routes:** Trailing commas throw error when parsing routes ([7bc1e05](https://github.com/compodoc/compodoc/commit/7bc1e05)), closes [#192](https://github.com/compodoc/compodoc/issues/192) [#173](https://github.com/compodoc/compodoc/issues/173)
-   **misc:** Miscellaneous sections Functions not showing documentation ([235f1d0](https://github.com/compodoc/compodoc/commit/235f1d0)), closes [#142](https://github.com/compodoc/compodoc/issues/142)
-   **deps:** add @default support ([78257cc](https://github.com/compodoc/compodoc/commit/78257cc)), closes [#212](https://github.com/compodoc/compodoc/issues/212)
-   **deps:** Bespoke types and Promise being converted to any type in output documentation ([35af038](https://github.com/compodoc/compodoc/commit/35af038)), closes [#208](https://github.com/compodoc/compodoc/issues/208)
-   **output:** Linux unix like environments: Absolute paths generates fonts, images, js and styles in the wrong directory ([e0a3c60](https://github.com/compodoc/compodoc/commit/e0a3c60)), closes [#206](https://github.com/compodoc/compodoc/issues/206)

### Features

-   **log:** add more logs on silent mode ([1c858c7](https://github.com/compodoc/compodoc/commit/1c858c7))
-   **chore:** run files generation in // +20% in speed generation :tada: ([832b20d](https://github.com/compodoc/compodoc/commit/832b20d))

<a name="1.0.0-beta.10"></a>

# [1.0.0-beta.10](https://github.com/compodoc/compodoc/compare/1.0.0-beta.9...1.0.0-beta.10) (2017-06-19)

### Bug Fixes

-   **menu:** Make the entire list item clickable for a section toggle ([4f4c1f5](https://github.com/compodoc/compodoc/commit/4f4c1f5)), closes [#194](https://github.com/compodoc/compodoc/issues/194)
-   **chore:** kind icon issue for properties and functions ([4b9f496](https://github.com/compodoc/compodoc/commit/4b9f496))
-   **menu:** Navigation: clicking on a sub element (page) inside the expandable category expands all categories ([86ac1b4](https://github.com/compodoc/compodoc/commit/86ac1b4)), closes [#186](https://github.com/compodoc/compodoc/issues/186)
-   **markdown:** At sign replaced by a brace in markdown code blocks ([41c6b0d](https://github.com/compodoc/compodoc/commit/41c6b0d)), closes [#189](https://github.com/compodoc/compodoc/issues/189)
-   **dependencies:** Multiple classes in the same file get the same description ([8a679f0](https://github.com/compodoc/compodoc/commit/8a679f0)), closes [#118](https://github.com/compodoc/compodoc/issues/118)
-   **exclude:** Not able to exclude files from documentation ([a88023c](https://github.com/compodoc/compodoc/commit/a88023c)), closes [#175](https://github.com/compodoc/compodoc/issues/175)
-   **source:** Hide some elements if source code is disabled ([0e81c15](https://github.com/compodoc/compodoc/commit/0e81c15)), closes [#185](https://github.com/compodoc/compodoc/issues/185)
-   **badge:** Documentation coverage badge size should match common badges ([21f5abe](https://github.com/compodoc/compodoc/commit/21f5abe)), closes [#200](https://github.com/compodoc/compodoc/issues/200)
-   **dependencies:** Interface generation missing w/o errors. ([2b7d4e7](https://github.com/compodoc/compodoc/commit/2b7d4e7)), closes [#198](https://github.com/compodoc/compodoc/issues/198)
-   **dependencies:** Please Support @private JSDoc. ([6c7ce67](https://github.com/compodoc/compodoc/commit/6c7ce67)), closes [#183](https://github.com/compodoc/compodoc/issues/183)
-   **comments:** Newline markdown ([74f64d2](https://github.com/compodoc/compodoc/commit/74f64d2)), closes [#195](https://github.com/compodoc/compodoc/issues/195)

### Features

-   **version** Detect angular version and link to the correct version of the documentation ([f270af7](https://github.com/compodoc/compodoc/commit/f270af7)), closes [#180](https://github.com/compodoc/compodoc/issues/180)
-   **dependencies:** Parsing refactoring, huge speed boost +75% ! ([65744ed](https://github.com/compodoc/compodoc/commit/65744ed))

<a name="1.0.0-beta.9"></a>

# [1.0.0-beta.9](https://github.com/compodoc/compodoc/compare/1.0.0-beta.8...1.0.0-beta.9) (2017-05-11)

### Bug Fixes

-   **markdown:** Fix escaping of html entities in code blocks ([e816cbe](https://github.com/compodoc/compodoc/commit/e816cbe)), thanks Thomas Mair
-   **config:** Allow for comments in tsconfig.json ([2796de5](https://github.com/compodoc/compodoc/commit/2796de5)), closes [#177](https://github.com/compodoc/compodoc/issues/177)
-   **chore:** Problem with resources file when providing absolute output path ([b52a40e7](https://github.com/compodoc/compodoc/commit/b52a40e7)), closes [#176](https://github.com/compodoc/compodoc/issues/176)
-   **watch:** Watch for additional doc too ([52801f4b](https://github.com/compodoc/compodoc/commit/52801f4b)), closes [#163](https://github.com/compodoc/compodoc/issues/163)
-   **dependencies:** decorators support ([65bbabc7](https://github.com/compodoc/compodoc/commit/65bbabc7)), closes [#171](https://github.com/compodoc/compodoc/issues/171)
-   **markdown:** Set marked break option to false ([0e6ac342](https://github.com/compodoc/compodoc/commit/0e6ac342)), closes [#181](https://github.com/compodoc/compodoc/issues/181)
-   **dependencies:** UTF8 Bom support ([a3d5bec7](https://github.com/compodoc/compodoc/commit/a3d5bec7)), closes [#170](https://github.com/compodoc/compodoc/issues/170)

### Features

-   **app** exclude with glob patterns ([6310735](https://github.com/compodoc/compodoc/commit/6310735)), closes [#174](https://github.com/compodoc/compodoc/issues/174)
-   **cli** display Node.js and OS infos after banner ([c0f60561](https://github.com/compodoc/compodoc/commit/c0f60561))

<a name="1.0.0-beta.8"></a>

# [1.0.0-beta.8](https://github.com/compodoc/compodoc/compare/1.0.0-beta.7...1.0.0-beta.8) (2017-04-26)

### Bug Fixes

-   **dependencies:** custom decorators breaks ([50578ec](https://github.com/compodoc/compodoc/commit/50578ec)), closes [#169](https://github.com/compodoc/compodoc/issues/169)
-   **UI:** Open menu when item selected ([70d38c7](https://github.com/compodoc/compodoc/commit/70d38c7)), closes [#168](https://github.com/compodoc/compodoc/issues/168)
-   **graph:** No Declarations or Providers being added to module graphs ([bf776f4](https://github.com/compodoc/compodoc/commit/bf776f4)), closes [#167](https://github.com/compodoc/compodoc/issues/167)

### Features

-   **files:** Better error reporting for template file reading ([6f2d783](https://github.com/compodoc/compodoc/commit/6f2d783))

<a name="1.0.0-beta.7"></a>

# [1.0.0-beta.7](https://github.com/compodoc/compodoc/compare/1.0.0-beta.6...1.0.0-beta.7) (2017-04-25)

### Bug Fixes

-   **overview:** Main overview graph is shifted on right side ([8fe238d](https://github.com/compodoc/compodoc/commit/8fe238d)), closes [#166](https://github.com/compodoc/compodoc/issues/166)

<a name="1.0.0-beta.6"></a>

# [1.0.0-beta.6](https://github.com/compodoc/compodoc/compare/1.0.0-beta.5...1.0.0-beta.6) (2017-04-25)

### Bug Fixes

-   **dependencies:** Unhandled promise rejection with "use strict" ([f56c01a](https://github.com/compodoc/compodoc/commit/f56c01a)), closes [#165](https://github.com/compodoc/compodoc/issues/165)
-   **links:** Interface Linking is wrong ([152c722](https://github.com/compodoc/compodoc/commit/152c722)), closes [#157](https://github.com/compodoc/compodoc/issues/157)

### Features

-   **component:** Expand on the Readme.md for component to use component.md (actual name of component) ([c246ffb](https://github.com/compodoc/compodoc/commit/c246ffb)), closes [#164](https://github.com/compodoc/compodoc/issues/164)
-   **coverage:** Coverage test command ([e15f238](https://github.com/compodoc/compodoc/commit/e15f238)), closes [#156](https://github.com/compodoc/compodoc/issues/156)

<a name="1.0.0-beta.5"></a>

# [1.0.0-beta.5](https://github.com/compodoc/compodoc/compare/1.0.0-beta.4...1.0.0-beta.5) (2017-04-22)

### Bug Fixes

-   **modules:** module graph controls JS error with file:// ([6d4be23](https://github.com/compodoc/compodoc/commit/6d4be23)), closes [#153](https://github.com/compodoc/compodoc/issues/153) [#159](https://github.com/compodoc/compodoc/issues/159)
-   **component:** custom treatment of the metadata field `template` ([1bbda74](https://github.com/compodoc/compodoc/commit/1bbda74)), closes [#137](https://github.com/compodoc/compodoc/issues/137)
-   **component:** loading template from another component fails ([1bbda74](https://github.com/compodoc/compodoc/commit/1bbda74)), closes [#147](https://github.com/compodoc/compodoc/issues/147)

<a name="1.0.0-beta.4"></a>

# [1.0.0-beta.4](https://github.com/compodoc/compodoc/compare/1.0.0-beta.3...1.0.0-beta.4) (2017-04-20)

### Bug Fixes

-   **directives:** "Implements" support for directives. ([6138070](https://github.com/compodoc/compodoc/commit/6138070)), closes [#155](https://github.com/compodoc/compodoc/issues/155)
-   **links:** Link to "Getting started" / "README" should be ./index.html ([8d30fd9](https://github.com/compodoc/compodoc/commit/8d30fd9)), closes [#158](https://github.com/compodoc/compodoc/issues/158)
-   **dependencies:** Main modules graph seems too confuse ([ef7b04f](https://github.com/compodoc/compodoc/commit/ef7b04f)), closes [#150](https://github.com/compodoc/compodoc/issues/150)

### Features

-   **app:** Link directly to the README of a component ([3636ce3](https://github.com/compodoc/compodoc/commit/3636ce3)), closes [#154](https://github.com/compodoc/compodoc/issues/154)

<a name="1.0.0-beta.3"></a>

# [1.0.0-beta.3](https://github.com/compodoc/compodoc/compare/1.0.0-beta.2...1.0.0-beta.3) (2017-04-05)

### Bug Fixes

-   **coverage:** Documentation coverage issue. ([a01ee06](https://github.com/compodoc/compodoc/commit/a01ee06)), closes [#143](https://github.com/compodoc/compodoc/issues/148)
-   **search:** Search links are broken. ([e81a0f7](https://github.com/compodoc/compodoc/commit/e81a0f7)), closes [#140](https://github.com/compodoc/compodoc/issues/146)

<a name="1.0.0-beta.2"></a>

# [1.0.0-beta.2](https://github.com/compodoc/compodoc/compare/1.0.0-beta.1...1.0.0-beta.2) (2017-04-04)

### Bug Fixes

-   **dom-tree:** Unable to view DOMTree nodes image correctly. ([2b5f275](https://github.com/compodoc/compodoc/commit/2b5f275)), closes [#143](https://github.com/compodoc/compodoc/issues/143)
-   **app:** Links are broken for static doc. ([da2e18e](https://github.com/compodoc/compodoc/commit/da2e18e)), closes [#140](https://github.com/compodoc/compodoc/issues/140)

### Features

-   **app:** toggleMenuItems for additionalPages ([692cfa0](https://github.com/compodoc/compodoc/commit/692cfa0))

<a name="1.0.0-beta.1"></a>

# [1.0.0-beta.1](https://github.com/compodoc/compodoc/compare/0.0.41...1.0.0-beta.1) (2017-04-03)

### Breaking changes

-   @compodoc/compodoc : move compodoc to @compodoc/compodoc

### Features

-   **app:** add component DOM tree graph in tab ([318d0c6](https://github.com/compodoc/compodoc/commit/318d0c6)), closes [#108](https://github.com/compodoc/compodoc/issues/108)
-   **app:** add outlet routes detail, cleaning ([a859976](https://github.com/compodoc/compodoc/commit/a859976))
-   **app:** additional documentation support ([8792b3a](https://github.com/compodoc/compodoc/commit/8792b3a))
-   **app:** component DOM tree clickable and link to known components ([ea5df1e](https://github.com/compodoc/compodoc/commit/ea5df1e))
-   **app:** details on unique names for routes ([6d0df01](https://github.com/compodoc/compodoc/commit/6d0df01))
-   **app:** display lazy-loaded modules infos / WIP ([5bc21dc](https://github.com/compodoc/compodoc/commit/5bc21dc))
-   **app:** link component DOM tree with directives founded ([3a8010a](https://github.com/compodoc/compodoc/commit/3a8010a))
-   **app:** misc type first support ([1db6781](https://github.com/compodoc/compodoc/commit/1db6781))
-   **app:** move to prism.js for syntax highlighting + "Defined in" link ([c252d6e](https://github.com/compodoc/compodoc/commit/c252d6e))
-   **app:** new routes page ([169730a](https://github.com/compodoc/compodoc/commit/169730a)), closes [#39](https://github.com/compodoc/compodoc/issues/39) [#17](https://github.com/compodoc/compodoc/issues/17)
-   **app:** routes guards ([aa27e65](https://github.com/compodoc/compodoc/commit/aa27e65))
-   **app:** routes page with modules support ([1a6a390](https://github.com/compodoc/compodoc/commit/1a6a390))
-   **app:** templateUrl file read ([53ceeb8](https://github.com/compodoc/compodoc/commit/53ceeb8))
-   **app:** toggleMenuItems option ([52891da](https://github.com/compodoc/compodoc/commit/52891da))
-   **app:** watch flag ([dbe7cb6](https://github.com/compodoc/compodoc/commit/dbe7cb6)), closes [#20](https://github.com/compodoc/compodoc/issues/20)
-   **app:** watch flag | add/remove support ([a276dac](https://github.com/compodoc/compodoc/commit/a276dac)), closes [#20](https://github.com/compodoc/compodoc/issues/20)
-   **menu:** display routes after all general items ([09a1caf](https://github.com/compodoc/compodoc/commit/09a1caf))
-   **routing:** display lazy loading routes ([075670e](https://github.com/compodoc/compodoc/commit/075670e))
-   **routing:** display routes length in overview ([a713aec](https://github.com/compodoc/compodoc/commit/a713aec))

### Bug Fixes

-   **app:** [@link](https://github.com/link) parsing ([55564d6](https://github.com/compodoc/compodoc/commit/55564d6))
-   **app:** add support for inheritanceand extends ([97cff59](https://github.com/compodoc/compodoc/commit/97cff59)), closes [#116](https://github.com/compodoc/compodoc/issues/116)
-   **app:** components don't have the correct data depth ([b6f20e5](https://github.com/compodoc/compodoc/commit/b6f20e5)), closes [#111](https://github.com/compodoc/compodoc/issues/111)
-   **app:** doesn't display routes pages if no routes ([d31d634](https://github.com/compodoc/compodoc/commit/d31d634))
-   **app:** functionSignature args 0 ([d93a39d](https://github.com/compodoc/compodoc/commit/d93a39d))
-   **app:** group misc by file, support of enums ([8031223](https://github.com/compodoc/compodoc/commit/8031223)), closes [#101](https://github.com/compodoc/compodoc/issues/101)
-   **app:** menu modules page link ([f92f871](https://github.com/compodoc/compodoc/commit/f92f871))
-   **app:** Multiple classes in the same file get the same description ([516ce47](https://github.com/compodoc/compodoc/commit/516ce47)), closes [#118](https://github.com/compodoc/compodoc/issues/118)
-   **app:** node 4 spread support ([aa53770](https://github.com/compodoc/compodoc/commit/aa53770))
-   **app:** promise sequential & node 4 ([354c0df](https://github.com/compodoc/compodoc/commit/354c0df))
-   **app:** Promise TS support ([8eeccb9](https://github.com/compodoc/compodoc/commit/8eeccb9))
-   **app:** Recognize ngOnInit() as a method | Angular Lifecycle hooks ([2f0d5c0](https://github.com/compodoc/compodoc/commit/2f0d5c0)), closes [#114](https://github.com/compodoc/compodoc/issues/114)
-   **app:** support of functions ([fe4ecf8](https://github.com/compodoc/compodoc/commit/fe4ecf8)), closes [#110](https://github.com/compodoc/compodoc/issues/110)
-   **app:** syntax highlightning / themes ([0822550](https://github.com/compodoc/compodoc/commit/0822550)), closes [#123](https://github.com/compodoc/compodoc/issues/123)
-   **app:** watch changed file strategy details ([3544cd9](https://github.com/compodoc/compodoc/commit/3544cd9))
-   **dependencies:** visitType error ([be6258d](https://github.com/compodoc/compodoc/commit/be6258d)), closes [#103](https://github.com/compodoc/compodoc/issues/103)
-   **doc-coverage:** ignore private, handle constructor ([d4b7274](https://github.com/compodoc/compodoc/commit/d4b7274)), closes [#122](https://github.com/compodoc/compodoc/issues/122)
-   **misc:** display file path ([8cd7a2e](https://github.com/compodoc/compodoc/commit/8cd7a2e)), closes [#101](https://github.com/compodoc/compodoc/issues/101)
-   **routes:** handle no lazy module ([aa85c63](https://github.com/compodoc/compodoc/commit/aa85c63))

<a name="0.0.41"></a>

## [0.0.41](https://github.com/compodoc/compodoc/compare/0.0.40...0.0.41) (2017-02-10)

### Bug Fixes

-   **app:** remove TypeScript dependency for JSDoc tags ([3a30eb7](https://github.com/compodoc/compodoc/commit/3a30eb7))
-   **app:** jsdoc tag example for component decorator ([786aea2](https://github.com/compodoc/compodoc/commit/786aea2)), closes [#100](https://github.com/compodoc/compodoc/issues/100), [#90](https://github.com/compodoc/compodoc/issues/90)
-   **app:** UnhandledPromiseRejectionWarning ([e9fdea5](https://github.com/compodoc/compodoc/commit/e9fdea5)), closes [#100](https://github.com/compodoc/compodoc/issues/100), [#103](https://github.com/compodoc/compodoc/issues/103)

### Features

-   **app** @example for pipe, component and directive decorators ([706322d](https://github.com/compodoc/compodoc/commit/706322d))

<a name="0.0.40"></a>

## [0.0.40](https://github.com/compodoc/compodoc/compare/0.0.39...0.0.40) (2017-02-08)

### Bug Fixes

-   **app:** ts.getJSDocTags availability ([b3af872](https://github.com/compodoc/compodoc/commit/b3af872)), closes [#104](https://github.com/compodoc/compodoc/issues/104), [#105](https://github.com/compodoc/compodoc/issues/105)
-   **app:** exclude part of the project from documentation generation ([a7374a9](https://github.com/compodoc/compodoc/commit/a7374a9)), closes [#102](https://github.com/compodoc/compodoc/issues/102)

<a name="0.0.39"></a>

## [0.0.39](https://github.com/compodoc/compodoc/compare/0.0.38...0.0.39) (2017-02-06)

### Bug Fixes

-   **app:** Private methods and properties are skipped / align to typedoc ([8490983](https://github.com/compodoc/compodoc/commit/8490983)), closes [#99](https://github.com/compodoc/compodoc/issues/99)
-   **app:** @link does not seem to be getting parsed for properties ([d1fd592](https://github.com/compodoc/compodoc/commit/d1fd592)), closes [#98](https://github.com/compodoc/compodoc/issues/98)
-   **app:** support indexable object ([cceb933](https://github.com/compodoc/compodoc/commit/cceb933)), closes [#97](https://github.com/compodoc/compodoc/issues/97)
-   **app:** Support @internal in the module level as well ([750cd63](https://github.com/compodoc/compodoc/commit/750cd63)), closes [#87](https://github.com/compodoc/compodoc/issues/87)
-   **app:** miscellaneous support | variables and functions ([d758840](https://github.com/compodoc/compodoc/commit/d758840)), closes [#55](https://github.com/compodoc/compodoc/issues/55)
-   **app:** remove base html tag, file:// support ([0e5227d](https://github.com/compodoc/compodoc/commit/0e5227d)), closes [#47](https://github.com/compodoc/compodoc/issues/47) [#35](https://github.com/compodoc/compodoc/issues/35)

### Features

-   **app:** move to @compodoc/ngd ([311facb](https://github.com/compodoc/compodoc/commit/311facb))
-   **app:** disablePrivateOrInternalSupport flag ([294d4e2](https://github.com/compodoc/compodoc/commit/294d4e2))

### Breaking changes

-   base tag removed. The documentation can now be opened directly with a browser.

<a name="0.0.38"></a>

## [0.0.38](https://github.com/compodoc/compodoc/compare/0.0.36...0.0.37) (2017-01-27)

### Bug Fixes

-   **app:** ngd call for output path with spaces ([37fe0a6](https://github.com/compodoc/compodoc/commit/37fe0a6)), closes [#44](https://github.com/compodoc/compodoc/issues/44)
-   **app:** class constructor test ([54b7c8e](https://github.com/compodoc/compodoc/commit/54b7c8e)), closes [#95](https://github.com/compodoc/compodoc/issues/95)
-   **app:** test if constructor available ([bd1cb92](https://github.com/compodoc/compodoc/commit/bd1cb92))

<a name="0.0.37"></a>

## [0.0.37](https://github.com/compodoc/compodoc/compare/0.0.36...0.0.37) (2017-01-26)

### Features

-   **app:** extend directive documentation ([1637178](https://github.com/compodoc/compodoc/commit/1637178)), closes [#91](https://github.com/compodoc/compodoc/issues/91)
-   **app:** Support for @example from JSDoc ([51cd282](https://github.com/compodoc/compodoc/commit/51cd282)), closes [#90](https://github.com/compodoc/compodoc/issues/90)
-   **app:** Support for @link from JSDoc ([f05b7e7](https://github.com/compodoc/compodoc/commit/f05b7e7)), closes [#92](https://github.com/compodoc/compodoc/issues/92)
-   **app:** include constructor method in docs ([ddd00dc](https://github.com/compodoc/compodoc/commit/ddd00dc)), closes [#94](https://github.com/compodoc/compodoc/issues/94)

<a name="0.0.36"></a>

## [0.0.36](https://github.com/compodoc/compodoc/compare/0.0.35...0.0.36) (2017-01-23)

### Bug Fixes

-   **app:** differentiate static members from instance members ([c8460eb](https://github.com/compodoc/compodoc/commit/c8460eb)), closes [#88](https://github.com/compodoc/compodoc/issues/88)

-   **app:** modules menu items shows even if no modules ([af72453](https://github.com/compodoc/compodoc/commit/af72453)), closes [#89](https://github.com/compodoc/compodoc/issues/89)

-   **app:** Image should resize to fit viewport ([2b24237](https://github.com/compodoc/compodoc/commit/2b24237)), closes [#83](https://github.com/compodoc/compodoc/issues/83)

-   **app:** @input without type ([0f92ca4](https://github.com/compodoc/compodoc/commit/0f92ca4))

-   **app:** file parsed doesn't exist ([eda183d](https://github.com/compodoc/compodoc/commit/eda183d))

-   **app:** interface keys sorting with [key: string]: string; ([4e4c5cd](https://github.com/compodoc/compodoc/commit/4e4c5cd))

-   **app:** component output type issue with NewExpression ([4e49d22](https://github.com/compodoc/compodoc/commit/4e49d22))

-   **app:** parsing .d.ts ([e38b571](https://github.com/compodoc/compodoc/commit/e38b571))

<a name="0.0.35"></a>

## [0.0.35](https://github.com/compodoc/compodoc/compare/0.0.34...0.0.35) (2017-01-20)

### Bug Fixes

-   **app:** multi-line in description and code hightlight in jsdocs params ([816027e](https://github.com/compodoc/compodoc/commit/816027e)), closes [#79](https://github.com/compodoc/compodoc/issues/79) [#77](https://github.com/compodoc/compodoc/issues/77) [#76](https://github.com/compodoc/compodoc/issues/76)

-   **app:** coverage report breaks ([462cf95](https://github.com/compodoc/compodoc/commit/462cf95)), closes [#65](https://github.com/compodoc/compodoc/issues/65) [#80](https://github.com/compodoc/compodoc/issues/80)

-   **app:** dont link to files excluded via tsconfig ([3063f10](https://github.com/compodoc/compodoc/commit/3063f10)), closes [#59](https://github.com/compodoc/compodoc/issues/59)

### Features

-   **app:** show component output `$event` type ([fa894f0](https://github.com/compodoc/compodoc/commit/fa894f0)), closes [#60](https://github.com/compodoc/compodoc/issues/60)

<a name="0.0.34"></a>

## [0.0.34](https://github.com/compodoc/compodoc/compare/0.0.33...0.0.34) (2017-01-19)

### Bug Fixes

-   **app:** nvm or nodejs / windows support ([0512c899](https://github.com/compodoc/compodoc/commit/0512c899)), closes [#44](https://github.com/compodoc/compodoc/issues/44)

### Features

-   **app:** support external assets folder ([90ba24d](https://github.com/compodoc/compodoc/commit/90ba24d)), closes [#71](https://github.com/compodoc/compodoc/issues/71)

<a name="0.0.33"></a>

## [0.0.33](https://github.com/compodoc/compodoc/compare/0.0.32...0.0.33) (2017-01-17)

### Bug Fixes

-   **app:** handle path with spaces for ngd call ([8037285](https://github.com/compodoc/compodoc/commit/8037285)), closes [#44](https://github.com/compodoc/compodoc/issues/44)
-   **app:** nvm-windows path issue ([7ac7373](https://github.com/compodoc/compodoc/commit/7ac7373)), closes [#65](https://github.com/compodoc/compodoc/issues/65)
-   **app:** disable highlightjs line-numbers on bash code blocks ([96a6ff4](https://github.com/compodoc/compodoc/commit/96a6ff4)), closes [#64](https://github.com/compodoc/compodoc/issues/64)
-   **app:** Cannot read property 'configuration' of undefined during external theme copy ([2127408](https://github.com/compodoc/compodoc/commit/2127408)), closes [#69](https://github.com/compodoc/compodoc/issues/69)

### Features

-   **app:** JSDoc tags support ([bc5b01f](https://github.com/compodoc/compodoc/commit/bc5b01f)), closes [#68](https://github.com/compodoc/compodoc/issues/68)
-   **app:** documentation coverage ([ddca8d4](https://github.com/compodoc/compodoc/commit/ddca8d4)), closes [#67](https://github.com/compodoc/compodoc/issues/67)

<a name="0.0.32"></a>

## [0.0.32](https://github.com/compodoc/compodoc/compare/0.0.31...0.0.32) (2017-01-12)

### Bug Fix

-   **app:** src argument handling ([14550f3](https://github.com/compodoc/compodoc/commit/14550f3)), closes [#63](https://github.com/compodoc/compodoc/issues/63)

<a name="0.0.31"></a>

## [0.0.31](https://github.com/compodoc/compodoc/compare/0.0.30...0.0.31) (2017-01-11)

### Bug Fixes

-   **app:** private properties in constructors ([2222446](https://github.com/compodoc/compodoc/commit/2222446)), closes [#61](https://github.com/compodoc/compodoc/issues/61)
-   **app:** functionSignature with Angular APIs ([58316dd](https://github.com/compodoc/compodoc/commit/58316dd))

### Features

-   **app:** link to Angular types ([0b33f74](https://github.com/compodoc/compodoc/commit/0b33f74)), closes [#57](https://github.com/compodoc/compodoc/issues/57)

<a name="0.0.30"></a>

## [0.0.30](https://github.com/compodoc/compodoc/compare/0.0.29...0.0.30) (2017-01-10)

### Bug Fixes

-   **app:** exclude internal members from generated documentation ([fc795c8](https://github.com/compodoc/compodoc/commit/fc795c8))
-   **app:** passing src and ngd error ([c0cfb2f](https://github.com/compodoc/compodoc/commit/c0cfb2f))

### Features

-   **app:** add an option to disable the graph ([927ed12](https://github.com/compodoc/compodoc/commit/927ed12))
-   **app:** Link to others types ([10f72f7](https://github.com/compodoc/compodoc/commit/10f72f7)), closes [#58](https://github.com/compodoc/compodoc/issues/58)
-   **app:** support TS shorthand for properties defined in constructor ([2965762](https://github.com/compodoc/compodoc/commit/2965762)), closes [#56](https://github.com/compodoc/compodoc/issues/56)

<a name="0.0.29"></a>

## [0.0.29](https://github.com/compodoc/compodoc/compare/0.0.28...0.0.29) (2017-01-07)

### Bug Fixes

-   **app:** handlebars breaking comments and highlightjs ([1347b74](https://github.com/compodoc/compodoc/commit/1347b74)), closes [#49](https://github.com/compodoc/compodoc/issues/49)
-   **app:** Syntax highlighting issue with tabs ([54edaa0](https://github.com/compodoc/compodoc/commit/54edaa0)), closes [#50](https://github.com/compodoc/compodoc/issues/50)

### Features

-   **cli:** Source folder option handling ([c3e86c6](https://github.com/compodoc/compodoc/commit/c3e86c6)), closes [#48](https://github.com/compodoc/compodoc/issues/48)

<a name="0.0.28"></a>

## [0.0.28](https://github.com/compodoc/compodoc/compare/0.0.27...0.0.28) (2017-01-03)

### Bug Fixes

-   **app:** open and port flag ([a34b39a](https://github.com/compodoc/compodoc/commit/a34b39a)), closes [#45](https://github.com/compodoc/compodoc/issues/45)
-   **design:** search input color ([a0fd0fe](https://github.com/compodoc/compodoc/commit/a0fd0fe))

<a name="0.0.27"></a>

## [0.0.27](https://github.com/compodoc/compodoc/compare/0.0.26...0.0.27) (2017-01-03)

### Bug Fixes

-   **app:** graph generation with path with spaces ([e833251](https://github.com/compodoc/compodoc/commit/e833251)), closes [#43](https://github.com/compodoc/compodoc/issues/43), [#44](https://github.com/compodoc/compodoc/issues/44)

<a name="0.0.26"></a>

## [0.0.26](https://github.com/compodoc/compodoc/compare/0.0.25...0.0.26) (2016-12-31)

### Bug Fixes

-   **app:** bin renaming ([557a0d1](https://github.com/compodoc/compodoc/commit/557a0d1))

<a name="0.0.25"></a>

## [0.0.25](https://github.com/compodoc/compodoc/compare/0.0.24...0.0.25) (2016-12-31)

### Features

-   **app:** source code tab ([8824e75](https://github.com/compodoc/compodoc/commit/8824e75))
-   **app:** toggle buttons for menu ([4037259](https://github.com/compodoc/compodoc/commit/4037259))

<a name="0.0.24"></a>

## [0.0.24](https://github.com/compodoc/compodoc/compare/0.0.23...0.0.24) (2016-12-28)

### Bug Fixes

-   **dependencies:** handle @injectable and @component at the same time for metadata ([f4d5ce8](https://github.com/compodoc/compodoc/commit/f4d5ce8)), closes [#41](https://github.com/compodoc/compodoc/issues/41)

### Features

-   **app:** library mode support, for gulp-compodoc ([5a65d87](https://github.com/compodoc/compodoc/commit/5a65d87))

<a name="0.0.23"></a>

## [0.0.23](https://github.com/compodoc/compodoc/compare/0.0.22...0.0.23) (2016-12-15)

### Bug Fixes

-   **dependencies:** multiple class declarations in one file ([fbc0d7b](https://github.com/compodoc/compodoc/commit/fbc0d7b)), closes [#37](https://github.com/compodoc/compodoc/issues/37)

### Features

-   **doc:** details for supported comments ([86851ca](https://github.com/compodoc/compodoc/commit/86851ca)), closes [#36](https://github.com/compodoc/compodoc/issues/36)

<a name="0.0.22"></a>

## [0.0.22](https://github.com/compodoc/compodoc/compare/0.0.21...0.0.22) (2016-12-12)

### Bug Fixes

-   **routes:** support for multiple components for same route ([5782415](https://github.com/compodoc/compodoc/commit/5782415)), closes [#33](https://github.com/compodoc/compodoc/issues/33)

### Features

-   **routes:** extend routes page : empty path, pathMatch ([4474973](https://github.com/compodoc/compodoc/commit/4474973))

<a name="0.0.21"></a>

## [0.0.21](https://github.com/compodoc/compodoc/compare/0.0.20...0.0.21) (2016-12-12)

### Bug Fixes

-   **app:** es6 object.assign support ([6c25f59](https://github.com/compodoc/compodoc/commit/6c25f59))

<a name="0.0.20"></a>

## [0.0.20](https://github.com/compodoc/compodoc/compare/0.0.19...0.0.20) (2016-12-12)

### Features

-   **search:** search bar ([3e3c8d0](https://github.com/compodoc/compodoc/commit/3e3c8d0))
-   **app:** add interfaces management ([896f233](https://github.com/compodoc/compodoc/commit/896f233))

<a name="0.0.19"></a>

## [0.0.19](https://github.com/compodoc/compodoc/compare/0.0.18...0.0.19) (2016-12-08)

### Bug Fixes

-   **menu:** scroll to active link ([1c1ef1f](https://github.com/compodoc/compodoc/commit/1c1ef1f)), closes [#27](https://github.com/compodoc/compodoc/issues/27)
-   **menu:** simple routes or modules entry active class ([ec81568](https://github.com/compodoc/compodoc/commit/ec81568))
-   **dependencies:** don't stop on routes parsing errors ([cef716b](https://github.com/compodoc/compodoc/commit/cef716b)), closes [#26](https://github.com/compodoc/compodoc/issues/26)
-   **app:** default serving port flag ([ea5ec23](https://github.com/compodoc/compodoc/commit/ea5ec23)), closes [#29](https://github.com/compodoc/compodoc/issues/29)

<a name="0.0.18"></a>

## [0.0.18](https://github.com/compodoc/compodoc/compare/0.0.17...0.0.18) (2016-12-05)

### Features

-   **design:** 7 new themes ([740e165](https://github.com/compodoc/compodoc/commit/740e165))

<a name="0.0.17"></a>

## [0.0.17](https://github.com/compodoc/compodoc/compare/0.0.16...0.0.17) (2016-12-01)

### Bug Fixes

-   **chore:** update supported version to Node.js 7+ ([8a8e0f6](https://github.com/compodoc/compodoc/commit/8a8e0f6)), closes [#18](https://github.com/compodoc/compodoc/issues/18)

<a name="0.0.16"></a>

## [0.0.16](https://github.com/compodoc/compodoc/compare/0.0.15...0.0.16) (2016-11-29)

### Bug Fixes

-   **app:** support old Node.js versions using babel ([8b9139c](https://github.com/compodoc/compodoc/commit/8b9139c)), closes [#25](https://github.com/compodoc/compodoc/issues/25)

### Features

-   **app:** delete top navbar, prepare for next design release ([9c1d7c2](https://github.com/compodoc/compodoc/commit/9c1d7c2))

<a name="0.0.15"></a>

## [0.0.15](https://github.com/compodoc/compodoc/compare/0.0.14...0.0.15) (2016-11-16)

### Bug Fixes

-   **overview:** blocks alignment ([6738c22](https://github.com/compodoc/compodoc/commit/6738c22))
-   **parsing:** class methods issue ([05316cb](https://github.com/compodoc/compodoc/commit/05316cb))
-   **parsing:** don't create ts program for each child on a file, 300% boost ! ([9f754cd](https://github.com/compodoc/compodoc/commit/9f754cd))

<a name="0.0.14"></a>

## [0.0.14](https://github.com/compodoc/compodoc/compare/0.0.13...0.0.14) (2016-11-15)

### Bug Fixes

-   **dependencies:** display uncommented functions or variables ([a9b47c2](https://github.com/compodoc/compodoc/commit/a9b47c2)), closes [#21](https://github.com/compodoc/compodoc/issues/21)

### Features

-   **app:** syntax highlighting for markdowns files ([c4800a7](https://github.com/compodoc/compodoc/commit/c4800a7)), closes [#19](https://github.com/compodoc/compodoc/issues/19)

<a name="0.0.13"></a>

## [0.0.13](https://github.com/compodoc/compodoc/compare/0.0.12...0.0.13) (2016-11-15)

### Features

-   **app:** support of one README.md file for each component ([f1c626d](https://github.com/compodoc/compodoc/commit/f1c626d)), closes [#10](https://github.com/compodoc/compodoc/issues/10)

<a name="0.0.12"></a>

## [0.0.12](https://github.com/compodoc/compodoc/compare/0.0.11...0.0.12) (2016-11-13)

### Features

-   **app:** provide external styling theme file ([3e4f98c](https://github.com/compodoc/compodoc/commit/3e4f98c)), closes [#9](https://github.com/compodoc/compodoc/issues/9)

<a name="0.0.11"></a>

## [0.0.11](https://github.com/compodoc/compodoc/compare/0.0.10...0.0.11) (2016-11-13)

### Bug Fixes

-   **dependencies:** windows file path issue ([2567f87](https://github.com/compodoc/compodoc/commit/2567f87)), closes [#14](https://github.com/compodoc/compodoc/issues/14)

<a name="0.0.10"></a>

## [0.0.10](https://github.com/compodoc/compodoc/compare/0.0.9...0.0.10) (2016-11-12)

### Bug Fixes

-   **app:** logo is overlaying menu ([71aad4b](https://github.com/compodoc/compodoc/commit/71aad4b)), closes [#13](https://github.com/compodoc/compodoc/issues/13)

<a name="0.0.9"></a>

## [0.0.9](https://github.com/compodoc/compodoc/compare/0.0.8...0.0.9) (2016-11-12)

### Bug Fixes

-   **app:** exclude by default node_modules folder ([69b1e4d](https://github.com/compodoc/compodoc/commit/69b1e4d)), closes [#11](https://github.com/compodoc/compodoc/issues/11)
-   **app:** handle ; after function in class ([eb7c7e1](https://github.com/compodoc/compodoc/commit/eb7c7e1)), closes [#12](https://github.com/compodoc/compodoc/issues/12)

### Features

-   **app:** add nyc and codecovfeat ([775875b](https://github.com/compodoc/compodoc/commit/775875b))
-   **routes:** display redirectTo ([e7448e7](https://github.com/compodoc/compodoc/commit/e7448e7))
-   **app:** display error for routes parsing ([69a52d7](https://github.com/compodoc/compodoc/commit/69a52d7))

<a name="0.0.8"></a>

## [0.0.8](https://github.com/compodoc/compodoc/compare/0.0.7...0.0.8) (2016-11-11)

### Bug Fixes

-   **app:** isGlobal npm context test ([3ddc9ce](https://github.com/compodoc/compodoc/commit/3ddc9ce))

<a name="0.0.7"></a>

## [0.0.7](https://github.com/compodoc/compodoc/compare/0.0.6...0.0.7) (2016-11-11)

### Bug Fixes

-   **app:** local call of ngd, even compodoc installed globally or locally ([8393fc0](https://github.com/compodoc/compodoc/commit/8393fc0)), closes [#5](https://github.com/compodoc/compodoc/issues/5)
-   **app:** local/global call of ngd ([b9163a7](https://github.com/compodoc/compodoc/commit/b9163a7))
-   **app:** handle -s -d and -p correctly ([dc0b388](https://github.com/compodoc/compodoc/commit/dc0b388)), closes [#6](https://github.com/compodoc/compodoc/issues/6)

### Features

-   **app:** rename file flag to tsconfig flag, details for base flag ([3b21bc0](https://github.com/compodoc/compodoc/commit/3b21bc0))
-   **app:** specify Node.js version ([c394caf](https://github.com/compodoc/compodoc/commit/c394caf))

### Breaking changes

-   -f flag is now -p flag. More similar to tsc flags.

<a name="0.0.6"></a>

## [0.0.6](https://github.com/compodoc/compodoc/compare/0.0.5...0.0.6) (2016-11-10)

### Bug Fixes

-   **app:** handlebars not in the dependencies list ([38aa0d6d](https://github.com/compodoc/compodoc/commit/38aa0d6d))

<a name="0.0.5"></a>

## [0.0.5](https://github.com/compodoc/compodoc/compare/0.0.4...0.0.5) (2016-11-09)

### Bug Fixes

-   **app:** handle false-positives ([f4e9d8a2](https://github.com/compodoc/compodoc/commit/f4e9d8a2))
-   **app:** fix class items ([295e9f81](https://github.com/compodoc/compodoc/commit/295e9f81))

<a name="0.0.4"></a>

## [0.0.4](https://github.com/compodoc/compodoc/compare/0.0.3...0.0.4) (2016-11-08)

### Bug Fixes

-   **overview:** syntax ([995696ea](https://github.com/compodoc/compodoc/commit/995696ea))

### Features

-   **app:** routes support ([8fe00e6f](https://github.com/compodoc/compodoc/commit/8fe00e6f))

<a name="0.0.3"></a>

## [0.0.3](https://github.com/compodoc/compodoc/compare/0.0.2...0.0.3) (2016-11-08)

### Bug Fixes

-   **app:** title argument ([4b37cf2](https://github.com/compodoc/compodoc/commit/4b37cf2))
-   **app:** css for menu, scroll bounce, mobile main height ([839a49a](https://github.com/compodoc/compodoc/commit/839a49a))

### Features

-   **app:** simple classes support ([35f2cc5](https://github.com/compodoc/compodoc/commit/35f2cc5))

<a name="0.0.2"></a>

## [0.0.2](https://github.com/compodoc/compodoc/compare/0.0.1...0.0.2) (2016-11-07)

### Bug Fixes

-   **modules:** link to each module page ([5673341](https://github.com/compodoc/compodoc/commit/5673341))
-   **module:** exclude Angular2 modules, WIP... ([0bc5dff3](https://github.com/compodoc/compodoc/commit/0bc5dff3))
-   **deps:** cleaning ([c817d4d](https://github.com/compodoc/compodoc/commit/c817d4d))

### Features

-   **app:** details on local server while serving ([0bc5dff](https://github.com/compodoc/compodoc/commit/0bc5dff))
-   **app:** display elapsed time for generation ([14c5bfd](https://github.com/compodoc/compodoc/commit/14c5bfd))
-   **html-engine:** put main page in cache ([d2a9937](https://github.com/compodoc/compodoc/commit/d2a9937))
-   **app:** silent mode ([005e64b](https://github.com/compodoc/compodoc/commit/005e64b))
-   **app:** update screenshots ([c33b729](https://github.com/compodoc/compodoc/commit/c33b729))
-   **app:** vectorised logo ([5de613b](https://github.com/compodoc/compodoc/commit/5de613b))
-   **app:** mobile menu ([b7ab594](https://github.com/compodoc/compodoc/commit/b7ab594))

<a name="0.0.1"></a>

## 0.0.1 (2016-11-07)

Initial release

### Features

Support of :

-   components
-   modules
-   directives
-   pipes
-   injectables
