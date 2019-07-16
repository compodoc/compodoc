import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI Additional documentation', () => {
    let stdoutString = undefined;
    let fooMenuFile;

    const distFolder = tmp.name + '-additional';

    before(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/todomvc-ng2/src/tsconfig.json',
            '-d',
            distFolder,
            '-a',
            './test/fixtures/todomvc-ng2/screenshots',
            '--includes',
            './test/fixtures/todomvc-ng2/additional-doc',
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
    after(() => tmp.clean(distFolder));

    it('it should have a menu with links', () => {
        expect(fooMenuFile.indexOf('<a href="additional-documentation/big-introduction') > -1).to.be
            .true;
        expect(fooMenuFile.indexOf('Big Introduction') > -1).to.be.true;
    });

    it('it should have generated files', () => {
        let isFileExists = exists(`${distFolder}/additional-documentation/edition.html`);
        expect(isFileExists).to.be.true;
        isFileExists = exists(`${distFolder}/additional-documentation/big-introduction.html`);
        expect(isFileExists).to.be.true;
        let file = read(`${distFolder}/additional-documentation/big-introduction.html`);
        expect(file).to.contain('<h1 id="introduction">Introduction</h1>');
    });

    it('should have generated README file in index.html', () => {
        const file = read(`${distFolder}/additional-documentation/edition/edition-of-a-todo.html`);
        expect(file).to.contain('screenshots/actions/edition.png');
    });

    it('should contain up to 5 level of depth', () => {
        expect(fooMenuFile.indexOf('for-chapter2') > -1).to.be.true;
        expect(fooMenuFile.indexOf('for-chapter3') > -1).to.be.true;
        expect(fooMenuFile.indexOf('for-chapter4') > -1).to.be.true;
        expect(fooMenuFile.indexOf('for-chapter5') > -1).to.be.true;

        expect(fooMenuFile.indexOf('for-chapter6') > -1).to.be.false;
    });

    it('should generate every link containing its parent reference', () => {
        [
            '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3.html',
            '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4.html',
            '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4/edit-level5.html'
        ].map(linkRef => expect(fooMenuFile.indexOf(linkRef) > -1).to.be.true);

        expect(
            fooMenuFile.indexOf(
                '<a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4/edit-level5/edit-level6.html'
            ) > -1
        ).to.be.false;
    });

    it('should have links in correct order', () => {
        expect(fooMenuFile).to.contain(
            `<li class="link for-chapter3">\n                                                <a href="additional-documentation/edition/edition-of-a-todo/edit-level3.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">edit-level3</a>\n                                            </li>\n                                            <li class="link for-chapter4">\n                                                <a href="additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">edit-level4</a>`
        );
    });
});
