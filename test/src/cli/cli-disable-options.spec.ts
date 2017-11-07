import * as chai from 'chai';
import {temporaryDir, shell, pkg, exists, exec, read, shellAsync} from '../helpers';
const expect = chai.expect,
      tmp = temporaryDir(),
      tsconfigPath = require.resolve('../../../tsconfig.json'),
      env = Object.freeze({TS_NODE_PROJECT: tsconfigPath, MODE:'TESTING'});

describe('CLI disable flags', () => {

    describe('disabling excluding methods with --disablePrivate', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disablePrivate',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should exclude methods marked as private', () => {
            expect(componentFile).not.to.contain('<code>privateMethod');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).to.contain('<code>internalMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).to.contain('<code>varprotected');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).to.contain('<code>ngOnInit');
        });
    });

    describe('disabling excluding methods with --disableProtected', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disableProtected',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should exclude methods marked as protected', () => {
            expect(componentFile).not.to.contain('<code>varprotected');
        });

        it('should include methods marked as private', () => {
            expect(componentFile).to.contain('<code>privateMethod');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).to.contain('<code>internalMethod');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).to.contain('<code>ngOnInit');
        });
    });

    describe('disabling excluding methods with --disableInternal', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disableInternal',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should exclude methods marked as @internal', () => {
            expect(componentFile).not.to.contain('<code>internalMethod');
        });

        it('should include methods marked as private', () => {
            expect(componentFile).to.contain('<code>privateMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).to.contain('<code>varprotected');
        });

        it('should display lifecyle hooks', () => {
            expect(componentFile).to.contain('<code>ngOnInit');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disableLifeCycleHooks',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).not.to.contain('<code>ngOnInit');
        });

        it('should include methods marked as private', () => {
            expect(componentFile).to.contain('<code>privateMethod');
        });

        it('should include stuff marked as protected', () => {
            expect(componentFile).to.contain('<code>varprotected');
        });

        it('should include methods marked as internal', () => {
            expect(componentFile).to.contain('<code>internalMethod');
        });
    });

    describe('disabling excluding methods with --disableLifeCycleHooks --disableInternal --disableProtected --disablePrivate', () => {

        let componentFile;
        before(function (done) {
            tmp.create();
            let ls = shell('node', [
                '../bin/index-cli.js',
                '-p', '../test/src/sample-files/tsconfig.simple.json',
                '--disablePrivate',
                '--disableProtected',
                '--disableInternal',
                '--disableLifeCycleHooks',
                '-d', '../' + tmp.name + '/'], { cwd: tmp.name, env});

            if (ls.stderr.toString() !== '') {
                console.error(`shell error: ${ls.stderr.toString()}`);
                done('error');
            }
            componentFile = read(`${tmp.name}/components/BarComponent.html`);
            done();
        });
        after(() => tmp.clean());

        it('should exclude lifecyle hooks', () => {
            expect(componentFile).not.to.contain('<code>ngOnInit');
        });

        it('should exclude methods marked as private', () => {
            expect(componentFile).not.to.contain('<code>privateMethod');
        });

        it('should exclude stuff marked as protected', () => {
            expect(componentFile).not.to.contain('<code>varprotected');
        });

        it('should exclude methods marked as internal', () => {
            expect(componentFile).not.to.contain('<code>internalMethod');
        });
    });
});
