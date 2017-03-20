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
    sauceConnect: true,
    tbTunnel: true,
    sauceConnectOpts: {
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        name: 'Compodoc test',
        'public': true,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
    }
});
