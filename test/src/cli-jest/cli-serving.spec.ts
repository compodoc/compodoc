import { shell, temporaryDir } from '../helpers';
const tmp = temporaryDir();

describe('CLI serving', () => {
    const distFolder = tmp.name + '-serving',
        TIMEOUT = 8000;

    describe('when serving with -s flag in another directory', () => {
        let stdoutString = '',
            child;
        beforeEach(function(done) {
            tmp.create(distFolder);
            let ls = shell('node', ['./bin/index-cli.js', '-s', '-d', distFolder], {
                timeout: TIMEOUT
            });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean(distFolder));

        it('should serve', () => {
            expect(stdoutString).toContain(
                `Serving documentation from ${distFolder} at http://127.0.0.1:8080`
            );
        });
    });

    describe('when serving with default directory', () => {
        let stdoutString = '',
            child;
        beforeEach(function(done) {
            tmp.create('documentation');
            let ls = shell(
                'node',
                ['./bin/index-cli.js', '-p', './test/src/sample-files/tsconfig.simple.json', '-s'],
                { timeout: 25000 }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });

        it('should display message', () => {
            expect(stdoutString).toContain(
                'Serving documentation from ./documentation/ at http://127.0.0.1:8080'
            );
        });
    });

    describe('when serving with default directory and different host', () => {
        let stdoutString = '',
            child;
        beforeEach(function(done) {
            tmp.create('documentation');
            let ls = shell(
                'node',
                [
                    './bin/index-cli.js',
                    '-p',
                    './test/src/sample-files/tsconfig.simple.json',
                    '-s',
                    '--host',
                    '127.0.0.2'
                ],
                { timeout: 25000 }
            );

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });

        it('should display message', () => {
            expect(stdoutString).toContain(
                'Serving documentation from ./documentation/ at http://127.0.0.2:8080'
            );
        });
    });

    describe('when serving with default directory and without doc generation', () => {
        let stdoutString = '',
            child;
        beforeEach(function(done) {
            let ls = shell('node', ['./bin/index-cli.js', '-s', '-d', './documentation/'], {
                timeout: TIMEOUT
            });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });

        it('should display message', () => {
            expect(stdoutString).toContain(
                'Serving documentation from ./documentation/ at http://127.0.0.1:8080'
            );
        });
    });

    describe('when serving with default directory, without -d and without doc generation', () => {
        let stdoutString = '',
            child;
        beforeEach(function(done) {
            let ls = shell('node', ['./bin/index-cli.js', '-s'], { timeout: TIMEOUT });

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            stdoutString = ls.stdout.toString();
            done();
        });
        afterEach(() => tmp.clean('documentation'));

        it('should display message', () => {
            expect(stdoutString).toContain(
                'Serving documentation from ./documentation/ at http://127.0.0.1:8080'
            );
        });
    });
});
