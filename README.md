<p align="center">
  <img src="https://avatars3.githubusercontent.com/u/23202313" alt="Compodoc: The missing documentation tool for your Angular application" width="226">
  <br>
  <a href="https://travis-ci.org/compodoc/compodoc"><img src="https://travis-ci.org/compodoc/compodoc.svg?branch=develop" alt="Build Status"></a>
  <a href="https://ci.appveyor.com/project/vogloblinsky/compodoc/branch/develop"><img src="https://ci.appveyor.com/api/projects/status/0wkundlfn3vs6r3m/branch/develop?svg=true" alt="Build Status"></a>
  <a href="https://codecov.io/gh/compodoc/compodoc"><img src="https://codecov.io/gh/compodoc/compodoc/branch/develop/graph/badge.svg" alt="Codecov"/></a>
  <a href="https://www.npmjs.com/package/@compodoc/compodoc"><img src="https://badge.fury.io/js/compodoc.svg" alt="npm badge"></a>
  <a href="https://david-dm.org/compodoc/compodoc"><img src="https://david-dm.org/compodoc/compodoc.svg" alt="npm dependencies"></a>
  <a href="https://david-dm.org/compodoc/compodoc?type=dev"><img src="https://david-dm.org/compodoc/compodoc/dev-status.svg" alt="npm devDependencies"></a>
  <a href="http://opensource.org/licenses/MIT"><img src="http://img.shields.io/badge/license-MIT-brightgreen.svg" alt="MIT badge"></a>
</p>
<p align="center">
    <img src="https://saucelabs.com/browser-matrix/compodoc.svg" alt="saucelabs badge">
</p>

<p align="center">The missing documentation tool for your Angular application</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/main-view.gif" alt="Compodoc: The missing documentation tool for your Angular application">
</p>

# Live Demo

[Demo](https://compodoc.github.io/compodoc-demo-todomvc-angular/) : documentation generated for [TodoMVC Angular Compodoc demo project](https://github.com/compodoc/compodoc-demo-todomvc-angular)

# Features

* **Clean, simple design** — With Compodoc, the main endpoints are on the left side of your documentation, and all the content on the right side

* **Beautiful themes** — 7 themes are available from famous documentation tools like [Gitbook](https://www.gitbook.com), [Read the Docs](https://readthedocs.org/) or projects like [Vagrant](https://www.vagrantup.com/docs/), [Laravel](https://laravel.com/docs/5.3), [Postmark](http://developer.postmarkapp.com/) and [Stripe](https://stripe.com/docs/api).

* **Search** — Compodoc include a powerful search engine ([lunr.js](http://lunrjs.com/)) for easily finding your information

* **Automatic table of contents** - API table of contents is generated using elements found during files parsing

* **Open-source and on npm** - Use it directly in your project using npm and one script, that's it !

* **A local tool** - No server needed, no sources uploaded online

* **JSDoc light support** - Support of @param, @returns, @link and @example tags

* **Documentation coverage** - Get the documentation coverage report of your project

* **Angular-CLI friendly** - Compodoc support out of the box Angular-CLI projects

# Table of Contents

- [Screenshots](#screenshots)
- [Who's using Compodoc ?](#whos-using-compodoc-)
- [Node.js versions](#node.js-versions)
- [Angular-CLI](#angular-cli)
- [Getting Started with compodoc](#getting-started-with-compodoc)
  - [Global installation](#global-installation)
  - [Local installation](#local-installation)
  - [Usage](#usage)
- [Themes](#themes)
- [Common use cases](#common-use-cases)
  - [Render documentation](#render-documentation)
  - [Serve generated documentation with compodoc](#serve-generated-documentation-with-compodoc)
  - [Render documentation, and serve it with compodoc](#render-documentation-and-serve-it-with-compodoc)
  - [Styling the documentation](#styling-hte-documentation)
  - [Documentation of each component](#documentation-of-each-component)
  - [Syntax highlighting in markdown files](#syntax-highlighting-in-markdown-files)
  - [Excluding files](#excluding-files)
- [Remark for comments](#remark-for-comments)
- [Remark for routes](#remark-for-routes)
- [Additional documentation](#additional-documentation)
- [Syntax highlighting in markdown files](#syntax-highlighting-in-markdown-files)
- [Excluding files](#excluding-files)
- [Roadmap](#roadmap)
- [Extensions](#extensions)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Resources](#resources)
- [License](#license)

## Screenshots

Using [SoundCloud API client / Angular2 project](https://github.com/r-park/soundcloud-ngrx) and default theme (gitbook)

README page             |  Overview page
:-------------------------:|:-------------------------:
![screenshot-1](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/1.png)  | ![screenshot-2](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/2.png)
Modules page             |  Single module page
![screenshot-3](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/3.png)  | ![screenshot-4](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/4.png)
Component page             |  Source code tab
![screenshot-5](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/5.png)  | ![screenshot-6](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/7.png)
Search page             |  Coverage report
![screenshot-7](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/6.png)  |![screenshot-8](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/8.png)

## Who's using Compodoc ?

- [angular-seed](https://github.com/mgechev/angular-seed)
- [angular-calendar](https://github.com/mattlewis92/angular-calendar)
- [angular-gauge](https://github.com/mattlewis92/angular-gauge)

These are some that [we know of](https://github.com/search?q=compodoc+filename%3Apackage.json+-user%3Acompodoc&ref=searchresults&type=Code&utf8=%E2%9C%93). Want your project listed here ? Drop us a line.

## Node.js versions

Compodoc is tested with only LTS versions : v6.9.4 & v4.7.1

## Angular-CLI

Compodoc supports last Angular-CLI version : [1.0.0-rc.0](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md)

Just run Compodoc in a fresh or existing project.

## Getting Started with compodoc

### Global installation

Install from npm :

```
npm install -g compodoc
```

### Local installation

```
npm install --save-dev compodoc
```

Define a script task for it in your package.json :

```
"scripts": {
  "compodoc": "./node_modules/.bin/compodoc -p src/tsconfig.json"
}
```

and run it like a normal npm script :

```
npm run compodoc
```

### Usage

```
$ compodoc --help

Usage: compodoc <src> [options]

Options:

  -h, --help                         output usage information
  -V, --version                      output the version number
  -p, --tsconfig [config]            A tsconfig.json file
  -d, --output [folder]              Where to store the generated documentation
  -y, --extTheme [file]              External styling theme
  -n, --name [name]                  Title documentation
  -a, --assetsFolder [folder]        External assets folder to copy in generated documentation folder
  -o, --open                         Open the generated documentation
  -t, --silent                       In silent mode, log messages aren't logged in the console
  -s, --serve                        Serve generated documentation (default http://localhost:8080/)
  -r, --port [port]                  Change default serving port
  -w, --watch                        Watch source files after serve and force documentation rebuild
  --theme [theme]                    Choose one of available themes, default is 'gitbook' (laravel, original, postmark, readthedocs, stripe, vagrant)
  --hideGenerator                    Do not print the Compodoc link at the bottom of the page
  --toggleMenuItems <items>          Close by default items in the menu ( example: 'all' or 'modules','components' )
  --includes [path]                  Path of external markdown files to include
  --includesName [name]              Name of item menu of externals markdown files (default "Additional documentation")
  --disableSourceCode                Do not add source code tab
  --disableGraph                     Disable rendering of the dependency graph
  --disableCoverage                  Do not add the documentation coverage report
  --disablePrivateOrInternalSupport  Do not show private or @internal in generated documentation
```

## Themes

Default (gitbook)             |  Laravel
:-------------------------:|:-------------------------:
![theme-gitbook](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-gitbook.png)  | ![theme-laravel](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-laravel.png)
Readthedocs             |  Stripe
![theme-readthedocs](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-readthedocs.png)  | ![theme-stripe](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-stripe.png)
Vagrant             |  Postmark
![theme-vagrant](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-vagrant.png)  | ![theme-postmark](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-postmark.png)
Original             |  
![theme-original](https://raw.githubusercontent.com/compodoc/compodoc/master/screenshots/theme-original.png)  |

## Common use cases

### Render documentation

Documentation is generated in default output folder, then run your HTTP server in that folder.

```
compodoc -p src/tsconfig.json
```

### Render documentation while providing source folder

```
compodoc src -p src/tsconfig.json
```

### Serve generated documentation with compodoc

Documentation was generated in default output folder or a specific one, the local HTTP server is launched at [http://localhost:8080](http://localhost:8080)

```
compodoc -s

or

compodoc -s -d ./doc
```

### Render documentation, and serve it with compodoc

Documentation is generated in default output folder, and a local HTTP server is available at [http://localhost:8080](http://localhost:8080)

```
compodoc -p src/tsconfig.json -s
```

### Styling the documentation
```
compodoc -p src/tsconfig.json -y your_theme_styles/
```

Inside your folder you need to provide at least a style.css file with these 5 imports as below.

```
@import "./reset.css";
@import "./bootstrap.min.css";
@import "./bootstrap-card.css";
@import "./font-awesome.min.css";
@import "./compodoc.css";
```

Compodoc use [bootstrap](http://getbootstrap.com/) 3.3.7. You can customize Compodoc easily.

[bootswatch.com](http://bootswatch.com/) can be a good starting point. If you want to override the default theme, just provide a bootstrap.min.css file, and it will override the default one.

```
└── your_theme_styles/
    ├── style.css // the main css file with default imports
    └── bootstrap.min.css // your bootstrap theme
```

### Documentation of each component

A comment description in xxx.component.ts file, between JSDoc comments can be a little short.

Compodoc search for a default README.md file inside the root folder of each component, and add it inside a tab in the component page.

```
└── my-component/
    ├── my.component.ts
    ├── my.component.spec.ts
    ├── my.component.scss|css
    ├── my.component.html
    └── README.md
```

The live demo as a component documented in that way : [TodoMVC Angular Compodoc demo / todo component](https://compodoc.github.io/compodoc-demo-todomvc-angular/components/TodoComponent.html)

## Remark for comments

Compodoc use Typescript AST parser and it's internal APIs, so the comments have to be JSDoc comments :

```
/**
 * Supported comment
 */
```

These ones are not supported :

```
/*
 * unsupported comment
 */

/*
  unsupported comment
 */

// unsupported comment
```

### JSDoc tags

Currently Compodoc only support these JSDoc tags :

- ```@returns```

- ```@param <param name>```

```
/**
 * @param {string} target  The target to process see {@link Todo}
 *
 * @example
 * This is a good example
 * processTarget('yo')
 *
 * @returns      The processed target number
 */
function processTarget(target:string):number;
```

- ```@link``` : you can use these three syntax like JSDoc:

```
//for an internal reference

{@link Todo}
[Todo]{@link Todo}
{@link Todo|TodoClass}

//for an external link

[Google]{@link http://www.google.com}
{@link http://www.apple.com|Apple}
{@link https://github.com GitHub}
```

- ```@example``` : for giving an example on directives, components and pipes decorators, use @example or markdown :

```
/**
 * Shows all events on a given day. Example usage:
 *
 * ```
 * &lt;mwl-calendar-day-view
 *  [viewDate]="viewDate"
 *  [events]="events"&gt;
 * &lt;/mwl-calendar-day-view&gt;
 * ```
 */

 /**
  * Shows all events on a given day. Example usage:
  *
  * @example
  * <mwl-calendar-day-view
  *  [viewDate]="viewDate"
  *  [events]="events">;
  * </mwl-calendar-day-view>
  */
```

## Remark for routes

Follow the style guide, provide a const of type 'Routes' and with an unique name :

```
const APP_ROUTES: Routes = [
    { path: 'about', component: AboutComponent },
    { path: '', component: HomeComponent}
];

...

RouterModule.forRoot(APP_ROUTES)
```

## Additional documentation

Compodoc support the addition of external markdown files for extending the code comments of your application and the main README file.

Create a folder containing markdown files and use ```--includes``` flag to extend the documentation.
Your folder should contain a __summary.json__ file explaining the structure and files :

```
summary.json

[
    {
        "title": "A TITLE",
        "file": "a-file.md"
    },
    {
        "title": "A TITLE",
        "file": "a-file.md",
        "children": [
            {
                "title": "A TITLE",
                "file": "a-sub-folder/a-file.md"
            }
        ]
    }
]
```

Links are supported like regular markdown links.

## Syntax highlighting in markdown files

Compodoc use [Marked](https://github.com/chjj/marked) for markdown parsing and compiling to html. [prismjs.js](http://prismjs.com/) has been added for supporting syntax highlighting.

Just use a normal code block in your markdown with correct language : [Github help](https://help.github.com/articles/creating-and-highlighting-code-blocks/)

The integrated languages are : __json, bash, javascript, markdown, html, typescript__

## Excluding files

For excluding files from the documentation, simply use the __exports__ property of [__tsconfig.json__](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) file.

## Roadmap

- [ ] study [ngast](https://github.com/mgechev/ngast) for replacing internal parser
- [ ] support for Angular 1.5+ projects written in Typescript
- [x] handle external markdown files as "functional" documentation
- [x] documentation coverage
- [x] routes
- [x] classes
- [x] module(s) page(s) with comments
- [x] component(s) page(s) with comments, API, class
- [x] directives
- [x] injectables
- [x] interfaces
- [x] pipes

## Extensions

### Gulp

There is a plugin available to run Compodoc with Gulp. You can find it on NPM:<br>
[https://www.npmjs.com/package/gulp-compodoc](https://www.npmjs.com/package/gulp-compodoc)

### JHispter

There is a JHipster module available to run Compodoc with JHipster. You can find it on NPM:<br>
[https://www.npmjs.com/package/generator-jhipster-compodoc](https://www.npmjs.com/package/generator-jhipster-compodoc)


## Contributing

Want to file a bug, contribute some code, or improve documentation? Excellent !

Read up on our guidelines for [contributing](https://github.com/compodoc/compodoc/blob/master/.github/CONTRIBUTING.md).

## Contributors

[<img alt="vogloblinsky" src="https://avatars3.githubusercontent.com/u/2841805?v=3&s=117" width="117">](https://github.com/vogloblinsky) |[<img alt="daniele-zurico" src="https://avatars3.githubusercontent.com/u/3193095?v=3&s=117" width="117">](https://github.com/daniele-zurico)|[<img alt="mattlewis92" src="https://avatars3.githubusercontent.com/u/6425649?v=3&s=117" width="117">](https://github.com/daniele-zurico)|
:---: |:---: |:---: |:---: |:---: |:---: |
[vogloblinsky](https://github.com/vogloblinsky) |[daniele-zurico](https://github.com/daniele-zurico)|[mattlewis92](https://github.com/mattlewis92)

## Resources

Inspired by stuff from [angular2-dependencies-graph](https://github.com/manekinekko/angular2-dependencies-graph), [ng-bootstrap](https://ng-bootstrap.github.io)

Logo designed using [Book vector designed by Freepik](http://www.freepik.com/free-photos-vectors/book)

## License

Everything in this repo is MIT License unless otherwise specified.

MIT © 2016-2017 - [Vincent Ogloblinsky](http://www.vincentogloblinsky.com)
