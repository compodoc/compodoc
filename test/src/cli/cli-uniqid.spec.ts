import * as chai from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';
const expect = chai.expect,
    tmp = temporaryDir();

describe('CLI Uniq id for file', () => {
    const distFolder = tmp.name + '-uniqid';

    let indexFile;
    before(function (done) {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/fixtures/sample-files/tsconfig.simple.json',
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

    it('it should contain a uniqid', () => {
        const expectedHash =
            process.platform === 'win32'
                ? '275074cbab50c18beecd656b624c9356'
                : 'dc56f8262412f8df33eba175cdc6200ab5cce4608521dd0f6242b9de45c505d7725b7e4cf2e4631b42d759ae86a1aac7f44e1234c398a7c0aef94a1c45e15d29';

        expect(indexFile).to.contain(expectedHash);
    });
});
