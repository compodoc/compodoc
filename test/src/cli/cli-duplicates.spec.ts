import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI duplicates support', () => {
    const distFolder = tmp.name + '-duplicates';

    before(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/todomvc-ng2-duplicates/src/tsconfig.json',
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

    it('Todo class generated', () => {
        const file = exists(distFolder + '/classes/Todo.html');
        expect(file).to.be.true;
    });

    it('Todo-1 class generated', () => {
        const file = exists(distFolder + '/classes/Todo-1.html');
        expect(file).to.be.true;
    });

    it('Todo-2 class generated', () => {
        const file = exists(distFolder + '/classes/Todo2.html');
        expect(file).to.be.true;
    });

    it('TimeInterface generated', () => {
        const file = exists(distFolder + '/interfaces/TimeInterface.html');
        expect(file).to.be.true;
    });

    it('TimeInterface-1 generated', () => {
        const file = exists(distFolder + '/interfaces/TimeInterface-1.html');
        expect(file).to.be.true;
    });

    it('EmptyService generated', () => {
        const file = exists(distFolder + '/injectables/EmptyService.html');
        expect(file).to.be.true;
    });

    it('EmptyService-1 generated', () => {
        const file = exists(distFolder + '/injectables/EmptyService-1.html');
        expect(file).to.be.true;
    });

    it('FirstUpperPipe generated', () => {
        const file = exists(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).to.be.true;
    });

    it('FirstUpperPipe-1 generated', () => {
        const file = exists(distFolder + '/pipes/FirstUpperPipe-1.html');
        expect(file).to.be.true;
    });

    it('NoopInterceptor generated', () => {
        const file = exists(distFolder + '/interceptors/NoopInterceptor.html');
        expect(file).to.be.true;
    });

    it('NoopInterceptor-1 generated', () => {
        const file = exists(distFolder + '/interceptors/NoopInterceptor-1.html');
        expect(file).to.be.true;
    });

    it('EmptyComponent generated', () => {
        const file = exists(distFolder + '/components/EmptyComponent.html');
        expect(file).to.be.true;
    });

    it('EmptyComponent-1 generated', () => {
        const file = exists(distFolder + '/components/EmptyComponent-1.html');
        expect(file).to.be.true;
    });

    it('DoNothingDirective generated', () => {
        const file = exists(distFolder + '/directives/DoNothingDirective.html');
        expect(file).to.be.true;
    });

    it('DoNothingDirective-1 generated', () => {
        const file = exists(distFolder + '/directives/DoNothingDirective-1.html');
        expect(file).to.be.true;
    });

    it('should support component inside module', () => {
        let file = read(distFolder + '/index.html');
        file = file.replace(/components-links-module-ValidationDemoModule-([a-zA-Z0-9-])+/g, 'components-links-module-ValidationDemoModule');
        if (file.indexOf('\r') !== -1) {
            // tslint:disable-next-line:max-line-length
            expect(file).to.contain(`id="components-links-module-ValidationDemoModule"\r\n>\r\n                                        <li class="link">\r\n                                            <a href="components/ValidationDemo.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ValidationDemo</a>`);
        } else {
            // tslint:disable-next-line:max-line-length
            expect(file).to.contain(`id="components-links-module-ValidationDemoModule"\n>\n                                        <li class="link">\n                                            <a href="components/ValidationDemo.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ValidationDemo</a>`);
        }
    });

    it('should support component inside module with duplicate', () => {
        let file = read(distFolder + '/index.html');
        file = file.replace(/components-links-module-FooterModule-([a-zA-Z0-9-])+/g, 'components-links-module-FooterModule');
        if (file.indexOf('\r') !== -1) {
            // tslint:disable-next-line:max-line-length
            expect(file).to.contain(`id="components-links-module-FooterModule"\r\n>\r\n                                        <li class="link">\r\n                                            <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>`);
            expect(file).to.contain(`<li class="link">\r\n                                <a href="components/FooterComponent-1.html" data-type="entity-link">FooterComponent</a>`);
        } else {
            // tslint:disable-next-line:max-line-length
            expect(file).to.contain(`id="components-links-module-FooterModule"\n>\n                                        <li class="link">\n                                            <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>`);
            expect(file).to.contain(`<li class="link">\n                                <a href="components/FooterComponent-1.html" data-type="entity-link">FooterComponent</a>`);
        }
    });
});
