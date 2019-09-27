import { CommandOptions } from 'commander';

import { InternalConfiguration } from './internal-configuration';

export interface CLIProgram extends InternalConfiguration {
    version(str: string, flags?: string, description?: string);

    option(
        flags: string,
        description?: string,
        fn?: ((arg1: any, arg2: any) => void) | RegExp,
        defaultValue?: any
    );
    option(flags: string, description?: string, defaultValue?: any);

    command(nameAndArgs: string, description: string, opts?: CommandOptions);
    parse(argv: string[]);
}
