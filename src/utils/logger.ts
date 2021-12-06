let log = require('fancy-log');
let c = require('chalk');

enum LEVEL {
    INFO,
    DEBUG,
    ERROR,
    WARN
}

class Logger {
    public logger;
    public silent;

    constructor() {
        this.logger = log;
        this.silent = true;
    }

    public info(...args) {
        if (!this.silent) {
            return;
        }
        this.logger(this.format(LEVEL.INFO, ...args));
    }

    public error(...args) {
        this.logger(this.format(LEVEL.ERROR, ...args));
    }

    public warn(...args) {
        if (!this.silent) {
            return;
        }
        this.logger(this.format(LEVEL.WARN, ...args));
    }

    public debug(...args) {
        if (!this.silent) {
            return;
        }
        this.logger(this.format(LEVEL.DEBUG, ...args));
    }

    private format(level, ...args) {
        let pad = (s, l, z = '') => {
            return s + Array(Math.max(0, l - s.length + 1)).join(z);
        };

        let msg = args.join(' ');
        if (args.length > 1) {
            msg = `${pad(args.shift(), 15, ' ')}: ${args.join(' ')}`;
        }

        switch (level) {
            case LEVEL.INFO:
                msg = c.green(msg);
                break;

            case LEVEL.DEBUG:
                msg = c.cyan(msg);
                break;

            case LEVEL.WARN:
                msg = c.yellow(msg);
                break;

            case LEVEL.ERROR:
                msg = c.red(msg);
                break;
        }

        return [msg].join('');
    }
}

export let logger = new Logger();
