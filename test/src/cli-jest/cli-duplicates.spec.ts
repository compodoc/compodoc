import { exists, read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI duplicates support', () => {
    const distFolder = tmp.name + '-duplicates';

    beforeEach(done => {
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
    afterEach(() => tmp.clean(distFolder));

    it('Todo class generated', () => {
        const file = exists(distFolder + '/classes/Todo.html');
        expect(file).toBeTruthy();
    });

    it('Todo-1 class generated', () => {
        const file = exists(distFolder + '/classes/Todo-1.html');
        expect(file).toBeTruthy();
    });

    it('Todo-2 class generated', () => {
        const file = exists(distFolder + '/classes/Todo-2.html');
        expect(file).toBeTruthy();
    });

    it('TimeInterface generated', () => {
        const file = exists(distFolder + '/interfaces/TimeInterface.html');
        expect(file).toBeTruthy();
    });

    it('TimeInterface-1 generated', () => {
        const file = exists(distFolder + '/interfaces/TimeInterface-1.html');
        expect(file).toBeTruthy();
    });

    it('EmptyService generated', () => {
        const file = exists(distFolder + '/injectables/EmptyService.html');
        expect(file).toBeTruthy();
    });

    it('EmptyService-1 generated', () => {
        const file = exists(distFolder + '/injectables/EmptyService-1.html');
        expect(file).toBeTruthy();
    });

    it('FirstUpperPipe generated', () => {
        const file = exists(distFolder + '/pipes/FirstUpperPipe.html');
        expect(file).toBeTruthy();
    });

    it('NoopInterceptor generated', () => {
        const file = exists(distFolder + '/interceptors/NoopInterceptor.html');
        expect(file).toBeTruthy();
    });

    it('NoopInterceptor-1 generated', () => {
        const file = exists(distFolder + '/interceptors/NoopInterceptor-1.html');
        expect(file).toBeTruthy();
    });

    it('EmptyComponent generated', () => {
        const file = exists(distFolder + '/components/EmptyComponent.html');
        expect(file).toBeTruthy();
    });

    it('EmptyComponent-1 generated', () => {
        const file = exists(distFolder + '/components/EmptyComponent-1.html');
        expect(file).toBeTruthy();
    });

    it('DoNothingDirective generated', () => {
        const file = exists(distFolder + '/directives/DoNothingDirective.html');
        expect(file).toBeTruthy();
    });

    it('DoNothingDirective-1 generated', () => {
        const file = exists(distFolder + '/directives/DoNothingDirective-1.html');
        expect(file).toBeTruthy();
    });

    it('should support component inside module', () => {
        let file = read(distFolder + '/js/menu-wc.js');
        file = file.replace(
            /components-links-module-ValidationDemoModule-([a-zA-Z0-9-])+/g,
            'components-links-module-ValidationDemoModule'
        );
        expect(file).toContain(
            `id="xs-components-links-module-ValidationDemoModule"\' }>\n                                            <li class="link">\n                                                <a href="components/ValidationDemo.html"\n                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ValidationDemo</a>`
        );
    });

    it('should support component inside module with duplicate', () => {
        let file = read(distFolder + '/js/menu-wc.js');
        file = file.replace(
            /components-links-module-FooterModule-([a-zA-Z0-9-])+/g,
            'components-links-module-FooterModule'
        );
        // tslint:disable-next-line:max-line-length
        expect(file).toContain(
            `id="xs-components-links-module-FooterModule"\' }>\n                                            <li class="link">\n                                                <a href="components/FooterComponent-1.html"\n                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>`
        );
        expect(file).toContain(
            `<li class="link">\n                                <a href="components/FooterComponent.html" data-type="entity-link">FooterComponent</a>`
        );
    });

    it('Injectable with multiple decorators should not appear twice', () => {
        let file = exists(distFolder + '/injectables/MyService.html');
        expect(file).toBeTruthy();
        file = exists(distFolder + '/injectables/MyService-1.html');
        expect(file).toBeFalsy();
    });
});
