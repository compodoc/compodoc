import { read, shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI generation - TypeDoc examples', () => {
    let stdoutString = undefined;
    const distFolder = tmp.name + '-typedoc';

    beforeAll(done => {
        tmp.create(distFolder);
        let ls = shell('node', [
            './bin/index-cli.js',
            '-p',
            './test/src/typedoc-examples/tsconfig.json',
            '-d',
            distFolder
        ]);

        if (ls.stderr.toString() !== '') {
            console.error(`shell error: ${ls.stderr.toString()}`);
            done('error');
        }
        stdoutString = ls.stdout.toString();
        done();
    });
    afterAll(() => tmp.clean(distFolder));

    it('should display generated message', () => {
        expect(stdoutString).toContain('Documentation generated');
    });

    it('interfaces - INameInterface', () => {
        const file = read(`${distFolder}/interfaces/INameInterface.html`);
        expect(file).toContain('This is a simple interface.');
        expect(file).toContain('This is a interface function of INameInterface.');
        expect(file).toContain('This is a interface member of INameInterface.');
    });

    it('interfaces - IPrintNameInterface', () => {
        const file = read(`${distFolder}/interfaces/IPrintNameInterface.html`);
        expect(file).toContain('This is a interface inheriting from two other interfaces.');
        expect(file).toContain('This is a interface function of IPrintNameInterface');
        expect(file).toContain('Extends');
    });

    it('classes - BaseClass', () => {
        const file = read(`${distFolder}/classes/BaseClass.html`);
        expect(file).toContain('This is a simple base class.');
        expect(file).toContain('Implements');
        expect(file).toContain('This is a private function.');
    });
});
