import { expect } from 'chai';
import { temporaryDir, shell, pkg, exists, exec, read, shellAsync } from '../helpers';

const tmp = temporaryDir();

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
                ? 'c48fd8283c5f5660d3412254501696cd5080663b5835017bc1e9eed1c6dd2b39afde4a46ac75ae8a261853dd21272e87c9451f4226401741750ea62ce2d23172'
                : '158bf392c406e8ef3801e83e8e0ffdb9b45d7482b0f3b6b12a7d29b1832e7161ee3e8fb870fea3332b07339e909f3aaa30c2a017cc2ed966c9a0b542ef2c1705';

        expect(indexFile).to.contain(expectedHash);
    });
});
