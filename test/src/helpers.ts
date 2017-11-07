export const shell = require('child_process').spawnSync;
export const spawn = require('child_process').spawn;
export const exec = require('child_process').exec;
export const shellAsync = require('child_process').spawn;
export const fs = require('fs-extra');
export const path = require('path');
export const pkg = require('../../package.json');

export function read(file: string): string {
    return fs.readFileSync(file).toString();
}

export function exists(file: string): boolean {
    return fs.existsSync(file);
}

export function stats(file: string): object {
    return fs.statSync(file);
}

export function remove(file: string): boolean {
    return fs.removeSync(file);
}

export function copy(source: string, dest: string): boolean {
    return fs.copySync(source, dest);
}

export function temporaryDir() {
    let name = '.tmp-compodoc-test';
    let cleanUp = (cleanUpName) => {
        if( fs.existsSync(cleanUpName) ) {
            fs.readdirSync(cleanUpName).forEach((file) => {
                const curdir = path.join(cleanUpName, file);
                if(fs.statSync(curdir).isDirectory()) {
                    cleanUp(curdir);
                } else {
                    fs.unlinkSync(curdir);
                }
            });
            fs.rmdirSync(cleanUpName);
        }
    };

    return {
        name,
        copy(source, destination) {
            fs.copySync(source, destination);
        },
        create(param?) {
            if (param) name = param;
            if (!fs.existsSync(name)) {
                fs.mkdirSync(name);
            }
        },
        clean(param?) {
            if (param) name = param;
            try {
                cleanUp(name);
            } catch (e) {}
        }
    };
}
