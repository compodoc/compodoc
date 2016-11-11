<p align="center">
  <img src="https://avatars3.githubusercontent.com/u/23202313" alt="Compodoc: The missing documentation tool for your Angular 2 application" width="226">
  <br>
  <a href="https://travis-ci.org/compodoc/compodoc"><img src="https://travis-ci.org/compodoc/compodoc.svg?branch=develop" alt="Build Status"></a>
  <a href="https://codecov.io/gh/compodoc/compodoc"><img src="https://codecov.io/gh/compodoc/compodoc/branch/develop/graph/badge.svg" alt="Codecov" /></a>
  <a href="https://www.npmjs.com/package/compodoc"><img src="https://badge.fury.io/js/compodoc.svg" alt="Build Status"></a>
  <a href="https://david-dm.org/compodoc/compodoc"><img src="https://david-dm.org/compodoc/compodoc.svg" alt="npm dependencies"></a>
  <a href="https://david-dm.org/compodoc/compodoc?type=dev"><img src="https://david-dm.org/compodoc/compodoc/dev-status.svg" alt="npm dev dependencies"></a>
</p>

<p align="center">The missing documentation tool for your Angular 2 application</p>

Features
------------

* **Clean, simple design** — With Compodoc, the main endpoints are on the left side of your documentation, and all the content on the right side

* **Compodoc is just markdown** — Write your comments with Markdown or provide externals Markdown files for enhancing the API documentation.

* **Automatic table of contents** - API table of contents is generated using elements found during files parsing

## Live Demo

Documentation generated for [TodoMVC Angular 2 Compodoc demo](https://compodoc.github.io/compodoc-demo-todomvc-angular2/)

## Static Demo

Using [SoundCloud API client / Angular2 project](https://github.com/r-park/soundcloud-ngrx)

README page             |  Overview page
:-------------------------:|:-------------------------:
![screenshot-1](https://raw.githubusercontent.com/groupe-sii/compodoc/master/screenshots/1.png)  | ![screenshot-2](https://raw.githubusercontent.com/groupe-sii/compodoc/master/screenshots/2.png)
Modules page             |  Single module page
![screenshot-3](https://raw.githubusercontent.com/groupe-sii/compodoc/master/screenshots/3.png)  | ![screenshot-4](https://raw.githubusercontent.com/groupe-sii/compodoc/master/screenshots/4.png)
Component page             |  
![screenshot-5](https://raw.githubusercontent.com/groupe-sii/compodoc/master/screenshots/5.png)  |

Getting Started with compodoc
------------------------------

### Install

Install from npm :

```
npm install -g compodoc
```

### Usage

```
$ compodoc --help

Usage: compodoc [options]

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -p, --tsconfig [config]  A tsconfig.json file
  -d, --output [folder]    Where to store the generated documentation
  -b, --base [base]        Base reference of html tag <base>
  -n, --name [name]        Title documentation
  -o, --open               Open the generated documentation
  -s, --serve              Serve generated documentation (default http://localhost:8080/)
  -g, --hideGenerator      Do not print the Compodoc link at the bottom of the page
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

### Common use cases

#### Render documentation

Documentation is generated in default output folder, then run your HTTP server in that folder.

```
compodoc -p src/tsconfig.json
```

#### Serve generated documentation with compodoc

Documentation was generated in default output folder or a specific one, the local HTTP server is launched at [http://localhost:8080](http://localhost:8080)

```
compodoc -s

or

compodoc -s -d ./doc
```

#### Render documentation, and serve it with compodoc

Documentation is generated in default output folder, and a local HTTP server is available at [http://localhost:8080](http://localhost:8080)

```
compodoc -p src/tsconfig.json -s
```

### Remark for routes

Follow the style guide and provide a const of type 'Routes' :

```
const APP_ROUTES: Routes = [
    { path: 'about', component: AboutComponent },
    { path: '', component: HomeComponent}
];

...

RouterModule.forRoot(APP_ROUTES)
```

### Why this tool ?

Because we doesn't find our needs on existing tools. We want to have a single place where there is :
- api documentation of code
- component(s), directive(s), pipe(s), ... documentation
- general documentation (\*.md files)

### Why not a SPA for outputed documentation ?

[KISS principle](https://en.wikipedia.org/wiki/KISS_principle) or shortly __"Keep it simple"__. We think static html files are simpler than another SPA inside an "SPA documentation".

### Roadmap

- [ ] handle external markdown files as "functional" documentation
- [ ] support for Angular 1.5+ projects written in Typescript
- [x] routes
- [x] classes
- [x] module(s) page(s) with comments
- [x] component(s) page(s) with comments, API, class
- [x] directives
- [x] injectables
- [x] pipes

### Resources

Inspired by stuff from [angular2-dependencies-graph](https://github.com/manekinekko/angular2-dependencies-graph), [ng-bootstrap](https://ng-bootstrap.github.io)

Logo designed using [Book vector designed by Freepik](http://www.freepik.com/free-photos-vectors/book)

### License

Everything in this repo is MIT License unless otherwise specified.

MIT © 2016 - [Vincent Ogloblinsky](http://www.vincentogloblinsky.com)
