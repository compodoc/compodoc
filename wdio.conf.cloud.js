'use strict'
const base = require('./wdio.conf.base')

exports.config = Object.assign(base.config, {
    capabilities: [{
            browserName: 'chrome',
            platform: 'WIN10',
            version: 'latest'
        },
        {
            browserName: 'firefox',
            platform: 'WIN10',
            version: 'latest'
        }
    ],
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    sauceConnect: true,
    tbTunnel: true,
    sauceConnectOpts: {
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        name: 'Compodoc test',
        'public': true,
        build: process.env.TRAVIS_BUILD_NUMBER,
        port: 80
    }
});
