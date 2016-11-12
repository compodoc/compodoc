export const shell = require('child_process').spawnSync;
export const exec = require('child_process').exec;
export const shellAsync = require('child_process').spawn;
export const fs = require('fs');
export const path = require('path');
export const pkg = require('../../package.json');

export function read(file: string): string {
    return fs.readFileSync(file).toString();
}

export function exists(file: string): boolean {
    return fs.existsSync(file);
}

export function temporaryDir() {
    let name = '.tmp-compodoc-test';
    let cleanUp = (name) => {
        if( fs.existsSync(name) ) {
            fs.readdirSync(name).forEach((file) => {
                var curdir = path.join(name, file);
                if(fs.statSync(curdir).isDirectory()) {
                    cleanUp(curdir);
                } else {
                    fs.unlinkSync(curdir);
                }
            });
            fs.rmdirSync(name);
        }
    };

    return {
        name,
        create(param?) {
            if (param) name = param;
            if (!fs.existsSync(name)){
                fs.mkdirSync(name);
            }
        },
        clean(param?) {
            if (param) name = param;
            cleanUp(name);
        }
    }
}
