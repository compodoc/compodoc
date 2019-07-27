import { CommanderStatic } from 'commander';

import { Flag, PUBLIC_FLAGS } from '../entities/public-flags';

export class SetupFlags {
    private static instance: SetupFlags;

    public program: CommanderStatic;

    constructor() {
        this.program = require('commander');
    }

    public static getInstance() {
        if (!SetupFlags.instance) {
            SetupFlags.instance = new SetupFlags();
        }
        return SetupFlags.instance;
    }

    public setup(pkg): CommanderStatic {
        this.program.version(pkg.version).usage('<src> [options]');

        PUBLIC_FLAGS.forEach((publicFlag: Flag) => {
            if (publicFlag.hasOwnProperty('defaultValue')) {
                this.program.option(
                    publicFlag.flag,
                    publicFlag.description,
                    publicFlag.defaultValue
                );
            } else if (publicFlag.parsingFunction) {
                const defaultValue = publicFlag.stringifyDefaultValue
                    ? JSON.stringify(publicFlag.defaultValue)
                    : publicFlag.defaultValue;
                this.program.option(
                    publicFlag.flag,
                    publicFlag.description,
                    publicFlag.parsingFunction,
                    defaultValue
                );
            } else {
                this.program.option(publicFlag.flag, publicFlag.description);
            }
        });

        this.program.parse(process.argv);

        return this.program;
    }
}

export default SetupFlags.getInstance();
