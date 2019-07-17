import * as fs from 'fs';
import * as path from 'path';

import { ts } from 'ts-morph';

const os = require('os');
const osName = require('os-name');

import AngularVersionUtil from '../../infrastructure/angular/angular-version.util';
import FileEngine from '../../infrastructure/files/file.engine';
import Logger from '../../infrastructure/logging/logger';

let cwd = process.cwd();

export class DisplayEnvironmentVersions {
    private static instance: DisplayEnvironmentVersions;

    constructor() {}

    public static getInstance() {
        if (!DisplayEnvironmentVersions.instance) {
            DisplayEnvironmentVersions.instance = new DisplayEnvironmentVersions();
        }
        return DisplayEnvironmentVersions.instance;
    }

    public display(compodocPackageJsonFile) {
        if (Logger.silent) {
            console.log(`Compodoc v${compodocPackageJsonFile.version}`);
        } else {
            console.log(fs.readFileSync(path.join(__dirname, '../src/banner')).toString());
            console.log(compodocPackageJsonFile.version);
            console.log('');
            console.log(`TypeScript version used by Compodoc : ${ts.version}`);
            console.log('');

            if (FileEngine.existsSync(cwd + path.sep + 'package.json')) {
                const packageData = FileEngine.getSync(cwd + path.sep + 'package.json');
                if (packageData) {
                    const parsedData = JSON.parse(packageData);
                    const projectDevDependencies = parsedData.devDependencies;
                    if (projectDevDependencies && projectDevDependencies.typescript) {
                        const tsProjectVersion = AngularVersionUtil.cleanVersion(
                            projectDevDependencies.typescript
                        );
                        console.log(`TypeScript version of current project : ${tsProjectVersion}`);
                        console.log('');
                    }
                }
            }

            console.log(`Node.js version : ${process.version}`);
            console.log('');
            console.log(`Operating system : ${osName(os.platform(), os.release())}`);
            console.log('');
        }
    }
}

export default DisplayEnvironmentVersions.getInstance();
