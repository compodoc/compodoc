import * as fs from 'fs-extra';
import * as os from 'node:os';
import * as path from 'node:path';

import { ts } from 'ts-morph';

import FileEngine from '../engines/file.engine';
import AngularVersionUtil from '../../utils/angular-version.util';
import { logger } from '../../utils/logger';
import { osName } from '../../utils/os-name.util';

const pkg = require('../../../package.json');

export interface StartupBannerOptions {
    isWatching: boolean;
    isLlmMdStdoutMode: boolean;
    loggerSilent: boolean;
    workingDirectory: string;
}

function readBanner(): string {
    const candidates = [
        path.join(__dirname, '../../../src/banner'),
        path.join(__dirname, '../../src/banner'),
        path.join(__dirname, '../src/banner')
    ];
    const bannerPath = candidates.find(candidate => fs.existsSync(candidate));

    return bannerPath ? fs.readFileSync(bannerPath).toString() : '';
}

export function printStartupBanner(options: StartupBannerOptions): void {
    if (options.isWatching) {
        return;
    }

    if (options.isLlmMdStdoutMode) {
        logger.silent = false;
        logger.logger = (msg: string) => process.stderr.write(`${msg}\n`);
        return;
    }

    if (!options.loggerSilent) {
        console.log(`Compodoc v${pkg.version}`);
        return;
    }

    console.log(readBanner());
    console.log(pkg.version);
    console.log('');
    console.log(`TypeScript version used by Compodoc : ${ts.version}`);
    console.log('');

    const packageJsonPath = `${options.workingDirectory + path.sep}package.json`;
    if (FileEngine.existsSync(packageJsonPath)) {
        const packageData = FileEngine.getSync(packageJsonPath);
        if (packageData) {
            const parsedData = JSON.parse(packageData);
            const projectDevDependencies = parsedData.devDependencies;
            if (projectDevDependencies?.typescript) {
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
