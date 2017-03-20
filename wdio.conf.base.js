'use strict'

exports.config = {
    specs: [
        './test/saucelabs/**/*.js'
    ],
    exclude: [],
    maxInstances: 2,
    sync: true,
    logLevel: 'verbose',
    coloredLogs: true,
    baseUrl: 'http://127.0.0.1:8383',
    waitforTimeout: 20000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 30000
    }
};
