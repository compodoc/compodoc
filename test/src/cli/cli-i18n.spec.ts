import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();
const vm = require('vm');

describe('CLI i18n', () => {
    const distFolder = tmp.name + '-i18n';

    const checkWcMenuFile = (lang, message) => {
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--language',
                lang,
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should contain a sentence in the correct language', () => {
            let file = read(distFolder + '/js/menu-wc.js');
            try {
                const script = new vm.Script(file);
            } catch (e) {
                throw new Error('Error parsing menu-wc.js file');
            }
            expect(file).to.contain(message);
        });
    };

    describe('with supported language - en-US', () => {
        return checkWcMenuFile('en-US', 'Documentation generated using');
    });

    describe('with supported language - es-ES', () => {
        return checkWcMenuFile('es-ES', 'Documentación generada utilizando');
    });

    describe('with supported language - fr-FR', () => {
        return checkWcMenuFile('fr-FR', 'Documentation générée avec');
    });

    describe('with supported language - it-IT', () => {
        return checkWcMenuFile('it-IT', 'Documentazione generata usando');
    });

    describe('with supported language - nl-NL', () => {
        return checkWcMenuFile('nl-NL', 'Documentatie gegenereed met');
    });

    describe('with supported language - pt-BR', () => {
        return checkWcMenuFile('pt-BR', 'Documentação gerada usando');
    });

    describe('with supported language - zh-CN', () => {
        return checkWcMenuFile('zh-CN', '文档生成使用');
    });

    describe('with un-supported language', () => {
        let indexFile;
        before(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', [
                './bin/index-cli.js',
                '-p',
                './test/src/sample-files/tsconfig.simple.json',
                '--language',
                'invalid-Lang',
                '-d',
                distFolder
            ]);

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            indexFile = read(`${distFolder}/js/menu-wc.js`);

            done();
        });
        after(() => tmp.clean(distFolder));

        it('it should contain a sentence in the correct language', () => {
            let file = read(distFolder + '/js/menu-wc.js');
            expect(file).to.contain('Documentation generated using');
        });
    });
});
