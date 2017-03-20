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
    host: 'ondemand.saucelabs.com',
    port: 80,
    sauceConnectOpts: {
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        build: process.env.TRAVIS_BUILD_NUMBER,
        logger: function (message) {
            console.log(message);
        }
    }
});
