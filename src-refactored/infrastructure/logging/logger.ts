import * as log from 'loglevel';

const chalk = require('chalk');
const loglevelpluginPrefix = require('loglevel-plugin-prefix');

const LEVEL = {
    LOG: chalk.green,
    DEBUG: chalk.cyan,
    INFO: chalk.green,
    WARN: chalk.yellow,
    ERROR: chalk.red
};

export class Logger {
    private static instance: Logger;

    public silent = false;

    constructor() {
        log.setLevel(0);
        loglevelpluginPrefix.reg(log);
        loglevelpluginPrefix.apply(log, {
            template: '[%t] :'
        });
    }

    public static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public log(...args) {
        if (this.silent) {
            return;
        }
        return log.debug(this.format(LEVEL.LOG, ...args));
    }

    public debug(...args) {
        if (this.silent) {
            return;
        }
        return log.debug(this.format(LEVEL.DEBUG, ...args));
    }

    public info(...args) {
        if (this.silent) {
            return;
        }
        return log.info(this.format(LEVEL.INFO, ...args));
    }

    public warn(...args) {
        if (this.silent) {
            return;
        }
        return log.warn(this.format(LEVEL.WARN, ...args));
    }

    public error(...args) {
        if (this.silent) {
            return;
        }
        return log.error(this.format(LEVEL.ERROR, ...args));
    }

    private format(level, ...args) {
        let msg = args.join(' ');

        switch (level) {
            case LEVEL.INFO:
            case LEVEL.LOG:
                msg = chalk.green(msg);
                break;

            case LEVEL.DEBUG:
                msg = chalk.cyan(msg);
                break;

            case LEVEL.WARN:
                msg = chalk.yellow(msg);
                break;

            case LEVEL.ERROR:
                msg = chalk.red(msg);
                break;
        }

        return [msg].join('');
    }
}

export default Logger.getInstance();
