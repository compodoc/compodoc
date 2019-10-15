import * as fs from 'fs-extra';
import * as path from 'path';

import { ts } from 'ts-morph';

const os = require('os');
const osName = require('os-name');

import AngularVersionUtil from '../../infrastructure/angular/angular-version.util';
import FileEngine from '../../infrastructure/files/file.engine';
import Logger from '../../infrastructure/logging/logger';

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
        const cwd = process.cwd();
        if (Logger.silent) {
            console.log(`Compodoc v${compodocPackageJsonFile.version}`);
        } else {
            let bannerPath = '../src/banner';

            /**
             * Switch between CLI and Unit testing environment
             */
            if (__dirname.substr(-4) !== 'dist') {
                bannerPath = '../../../src/banner';
            }

            console.log(fs.readFileSync(path.join(__dirname, bannerPath)).toString());
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
