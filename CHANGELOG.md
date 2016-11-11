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

* **app:** handlebars not in the dependencies list ([38aa0d6d](https://github.com/groupe-sii/compodoc/commit/38aa0d6d))

<a name="0.0.5"></a>
## 0.0.5 (2016-11-09)

### Bug Fixes

* **app:** handle false-positives ([f4e9d8a2](https://github.com/groupe-sii/compodoc/commit/f4e9d8a2))
* **app:** fix class items ([295e9f81](https://github.com/groupe-sii/compodoc/commit/295e9f81))

<a name="0.0.4"></a>
## 0.0.4 (2016-11-08)

### Bug Fixes

* **overview:** syntax ([995696ea](https://github.com/groupe-sii/compodoc/commit/995696ea))

### Features

* **app:** routes support ([8fe00e6f](https://github.com/groupe-sii/compodoc/commit/8fe00e6f))

<a name="0.0.3"></a>
## 0.0.3 (2016-11-08)

### Bug Fixes

* **app:** title argument ([4b37cf2](https://github.com/groupe-sii/compodoc/commit/4b37cf2))
* **app:** css for menu, scroll bounce, mobile main height ([839a49a](https://github.com/groupe-sii/compodoc/commit/839a49a))

### Features

* **app:** simple classes support ([35f2cc5](https://github.com/groupe-sii/compodoc/commit/35f2cc5))

<a name="0.0.2"></a>
## 0.0.2 (2016-11-07)

### Bug Fixes

* **modules:** link to each module page ([5673341](https://github.com/groupe-sii/compodoc/commit/5673341))
* **module:**  exclude Angular2 modules, WIP... ([0bc5dff3](https://github.com/groupe-sii/compodoc/commit/0bc5dff3))
* **deps:** cleaning ([c817d4d](https://github.com/groupe-sii/compodoc/commit/c817d4d))

### Features

* **app:** details on local server while serving ([0bc5dff](https://github.com/groupe-sii/compodoc/commit/0bc5dff))
* **app:** display elapsed time for generation ([14c5bfd](https://github.com/groupe-sii/compodoc/commit/14c5bfd))
* **html-engine:** put main page in cache ([d2a9937](https://github.com/groupe-sii/compodoc/commit/d2a9937))
* **app:** silent mode ([005e64b](https://github.com/groupe-sii/compodoc/commit/005e64b))
* **app:** update screenshots ([c33b729](https://github.com/groupe-sii/compodoc/commit/c33b729))
* **app:** vectorised logo ([5de613b](https://github.com/groupe-sii/compodoc/commit/5de613b))
* **app:** mobile menu ([b7ab594](https://github.com/groupe-sii/compodoc/commit/b7ab594))

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
