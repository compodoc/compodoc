import { exists, read, shell, temporaryDir } from '../helpers';

const tmp = temporaryDir();

describe('CLI Additional documentation', () => {
    let stdoutString = undefined;
    let fooMenuFile;

    const distFolder = tmp.name + '-additional';

    beforeAll(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/todomvc-ng2/src/tsconfig.json',
            '-d',
            distFolder,
            '-a',
            './test/src/todomvc-ng2/screenshots',
            '--includes',
            './test/src/todomvc-ng2/additional-doc',
            '--includesName',
            '"Additional documentation"'
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        fooMenuFile = read(`${distFolder}/js/menu-wc.js`);
        done();
    });
    afterAll(() => tmp.clean(distFolder));

    it('it should have a menu with links', () => {
        expect(
            fooMenuFile.indexOf('<a href="additional-documentation/big-introduction') > -1
        ).toBeTruthy();
        expect(fooMenuFile.indexOf('Big Introduction') > -1).toBeTruthy();
    });

    it('it should have generated files', () => {
        let isFileExists = exists(`${distFolder}/additional-documentation/edition.html`);
        expect(isFileExists).toBeTruthy();
        isFileExists = exists(`${distFolder}/additional-documentation/big-introduction.html`);
        expect(isFileExists).toBeTruthy();
        let file = read(`${distFolder}/additional-documentation/big-introduction.html`);
        expect(file).toContain('<h1 id="introduction">Introduction</h1>');
    });

    it('should have generated README file in index.html', () => {
        const file = read(`${distFolder}/additional-documentation/edition/edition-of-a-todo.html`);
        expect(file).toContain('screenshots/actions/edition.png');
    });

    it('should contain up to 5 level of depth', () => {
        expect(fooMenuFile.indexOf('for-chapter2') > -1).toBeTruthy();
        expect(fooMenuFile.indexOf('for-chapter3') > -1).toBeTruthy();
        expect(fooMenuFile.indexOf('for-chapter4') > -1).toBeTruthy();
        expect(fooMenuFile.indexOf('for-chapter5') > -1).toBeTruthy();

        expect(fooMenuFile.indexOf('for-chapter6') > -1).toBeFalsy();
    });

    it('should generate every link containing its parent reference', () => {
        [
            '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3.html',
            '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4.html',
            '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4/edit-level5.html'
        ].map(linkRef => expect(fooMenuFile.indexOf(linkRef) > -1).toBeTruthy());

        expect(
            fooMenuFile.indexOf(
                '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4/edit-level5/edit-level6.html'
            ) > -1
        ).toBeFalsy();
    });

    it('should have links in correct order', () => {
        expect(fooMenuFile).toContain(
            `<li class="link for-chapter3">\n                                                <a href="additional-documentation/edition/edition-of-a-todo/edit-level3.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">edit-level3</a>\n                                            </li>\n                                            <li class="link for-chapter4">\n                                                <a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">edit-level4</a>`
        );
    });
});
