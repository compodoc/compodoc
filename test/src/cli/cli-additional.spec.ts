import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const expect = chai.expect;
const tmp = temporaryDir();

describe('CLI Additional documentation', () => {
    let stdoutString = undefined;
    let fooIndexFile: string;
    let fooServiceFile;

    const distFolder = tmp.name + '-additional';

    before(done => {
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
        fooIndexFile = read(`${distFolder}/index.html`);
        done();
    });
    after(() => tmp.clean(distFolder));

    it('it should have a menu with links', () => {
        expect(fooIndexFile.indexOf('<a href="./additional-documentation/big-introduction') > -1).to
            .be.true;
        expect(fooIndexFile.indexOf('Big Introduction') > -1).to.be.true;
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
        expect(fooIndexFile.indexOf('for-chapter2') > -1).to.be.true;
        expect(fooIndexFile.indexOf('for-chapter3') > -1).to.be.true;
        expect(fooIndexFile.indexOf('for-chapter4') > -1).to.be.true;
        expect(fooIndexFile.indexOf('for-chapter5') > -1).to.be.true;

        expect(fooIndexFile.indexOf('for-chapter6') > -1).to.be.false;
    });

    it('should generate every link containing its parent reference', () => {
        [
            '<a href="./additional-documentation/edition/edition-of-a-todo/edit-level3.html',
            '<a href="./additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4.html',
            '<a href="./additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4/edit-level5.html'
        ].map(linkRef => expect(fooIndexFile.indexOf(linkRef) > -1).to.be.true);

        expect(
            fooIndexFile.indexOf(
                '<a href="./additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4/edit-level5/edit-level6.html'
            ) > -1
        ).to.be.false;
    });

    it('should have links in correct order', () => {
        expect(fooIndexFile).to.contain(
            `<li class="link for-chapter3">\n                                    <a href="./additional-documentation/edition/edition-of-a-todo/edit-level3.html" >edit-level3</a>\n                                </li>\n                                <li class="link for-chapter4">\n                                    <a href="./additional-documentation/edition/edition-of-a-todo/edit-level3/edit-level4.html" >edit-level4</a>\n                                </li>`
        );
    });
});
