var webdriverio = require('webdriverio'),
    client = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'chrome',
            version: '56',
            platform: 'WIN7',
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            name: 'Compodoc test',
            'public': true,
            build: process.env.TRAVIS_BUILD_NUMBER
        },
        host: 'ondemand.saucelabs.com',
        port: 80,
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        logLevel: 'verbose'
    }).init();

client
    .url('http://127.0.0.1:8383')
    .getTitle(function(err, title) {
        console.log(title);
    })
    .end();

/*
client = webdriverio.remote({
    desiredCapabilities: {
        browserName: 'firefox',
        version: '50',
        platform: 'XP',
        name: 'Compodoc test',
        'public': true
    },
    host: 'ondemand.saucelabs.com',
    port: 80,
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    logLevel: 'verbose'
}).init()

client
    .url('http://google.com')
    .setValue('*[name="q"]', 'webdriverio')
    .click('*[name="btnG"]')
    .pause(1000)
    .getTitle(function(err, title) {
        console.log(title);
    })
    .end();
*/
