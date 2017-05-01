let gutil = require('gulp-util')
let c = gutil.colors;
let pkg = require('../package.json');

enum LEVEL {
	INFO,
	DEBUG,
    ERROR,
    WARN
}

class Logger {

	name;
	logger;
	version;
	silent;

	constructor() {
		this.name = pkg.name;
		this.version = pkg.version;
		this.logger = gutil.log;
		this.silent = true;
	}

	info(...args) {
		if(!this.silent) return;
		this.logger(
			this.format(LEVEL.INFO, ...args)
		);
	}

	error(...args) {
		if(!this.silent) return;
		this.logger(
			this.format(LEVEL.ERROR, ...args)
		);
	}

    warn(...args) {
		if(!this.silent) return;
		this.logger(
			this.format(LEVEL.WARN, ...args)
		);
	}

	debug(...args) {
		if(!this.silent) return;
		this.logger(
			this.format(LEVEL.DEBUG, ...args)
		);
	}

	private format(level, ...args) {

		let pad = (s, l, c='') => {
			return s + Array( Math.max(0, l - s.length + 1)).join( c )
		};

		let msg = args.join(' ');
		if(args.length > 1) {
			msg = `${ pad(args.shift(), 15, ' ') }: ${ args.join(' ') }`;
		}


		switch(level) {
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

		return [
			msg
		].join('');
	}
}

export let logger = new Logger();
