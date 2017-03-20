'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
    capabilities: [{
            browserName: 'chrome',
            platform: 'WIN10',
            version: 'latest',
            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
            build: process.env.TRAVIS_BUILD_NUMBER,
            name: 'Compodoc test'
        },
        {
            browserName: 'firefox',
            platform: 'WIN10',
            version: 'latest',
            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
            build: process.env.TRAVIS_BUILD_NUMBER,
            name: 'Compodoc test'
        }
    ],
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    sauceConnect: true,
    sauceConnectOpts: {
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        username: 'compodoc',
        accessKey: 'dc96897d-c007-4e78-bee6-a17d20dff52d',
        verboseDebugging: true,
        vv: true,
        port: 80,
        logger: console.log,
        verbose: true
    }
});
