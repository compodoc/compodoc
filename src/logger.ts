let gutil = require('gulp-util')
let c = gutil.colors;
let pkg = require('../package.json');

enum LEVEL {
	INFO,
	WARN,
	DEBUG,
	FATAL, ERROR
}

class Logger {

	name;
	logger;
	version;

	constructor() {
		this.name = pkg.name;
		this.version = pkg.version;
		this.logger = gutil.log;
	}

	title(...args) {
		this.logger(
			c.cyan(...args)
		);
	}

	info(...args) {
		this.logger(
			this.format(LEVEL.INFO, ...args)
		);
	}

	warn(...args) {
		this.logger(
			this.format(LEVEL.WARN, ...args)
		);
	}

	error(...args) {
		this.logger(
			this.format(LEVEL.FATAL, ...args)
		);
	}

	fatal(...args) {
		this.error(...args);
	}

	debug(...args) {
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

			case LEVEL.WARN:
				msg = c.gray(msg);
				break;

			case LEVEL.DEBUG:
				msg = c.cyan(msg);
				break;

			case LEVEL.ERROR:
			case LEVEL.FATAL:
				msg = c.red(msg);
				break;
		}

		return [
			msg
		].join('');
	}
}

export let logger = new Logger();
