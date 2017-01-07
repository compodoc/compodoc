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
