import { expect } from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';

import { cleanSourcesForWatch, normalizeWatchFilePath } from '../../../../src/utils/utils';

describe('Watch path utilities', () => {
    describe('normalizeWatchFilePath', () => {
        it('should resolve relative paths from the provided base path', () => {
            const basePath = path.resolve(process.cwd(), 'test/fixtures');
            const result = normalizeWatchFilePath('sample-files/index.ts', basePath);

            expect(result).to.equal(path.resolve(basePath, 'sample-files/index.ts'));
        });

        it('should keep absolute POSIX paths as-is', () => {
            const absolutePath = path.resolve(process.cwd(), 'test/fixtures/sample-files/index.ts');
            const result = normalizeWatchFilePath(absolutePath, process.cwd());

            expect(result).to.equal(path.normalize(absolutePath));
        });

        it('should keep absolute Windows-style paths as-is', () => {
            const windowsPath = 'C:\\repo\\src\\app.component.ts';
            const result = normalizeWatchFilePath(windowsPath, process.cwd());

            expect(result).to.equal(path.normalize(windowsPath));
        });
    });

    describe('cleanSourcesForWatch', () => {
        const tempRoot = path.join(process.cwd(), '.tmp-watch-path-utils');
        const absoluteFile = path.join(tempRoot, 'absolute.ts');
        const relativeFile = '.tmp-watch-path-utils/relative.md';

        before(() => {
            fs.ensureDirSync(tempRoot);
            fs.writeFileSync(absoluteFile, 'export const absolute = true;');
            fs.writeFileSync(path.join(process.cwd(), relativeFile), '# relative');
        });

        after(() => {
            fs.removeSync(tempRoot);
        });

        it('should keep existing absolute and relative sources', () => {
            const result = cleanSourcesForWatch([absoluteFile, relativeFile, 'missing-file.ts']);

            expect(result).to.include(absoluteFile);
            expect(result).to.include(relativeFile);
            expect(result).to.not.include('missing-file.ts');
        });
    });
});
