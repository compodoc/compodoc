import { Flag, PUBLIC_FLAGS } from '../entities/public-flags';
import { CLIProgram } from '../entities/cli-program';

export class SetupFlags {
    private static instance: SetupFlags;

    public program: CLIProgram;

    constructor() {
        this.program = require('commander');
        this.program.storeOptionsAsProperties(true);
    }

    public static getInstance() {
        if (!SetupFlags.instance) {
            SetupFlags.instance = new SetupFlags();
        }
        return SetupFlags.instance;
    }

    public setup(pkg): CLIProgram {
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

        /**
         * TODO : return something wrapping program and handling internal configuration
         */
        return this.program;
    }
}

export default SetupFlags.getInstance();
