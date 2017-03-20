var expect = require('chai').expect,
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver'),
    username = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    capabilities:any = {
        'platform': 'WIN7',
        'username': username,
        'accessKey': accessKey,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        name: 'Compodoc test',
        'public': true,
        build: process.env.TRAVIS_BUILD_NUMBER
    },

    testCode = function() {
        var driver = new webdriver.Builder()
            .withCapabilities(capabilities)
            .usingServer("http://" + username + ":" + accessKey + "@ondemand.saucelabs.com:80/wd/hub")
            .build();
        driver.get('http://127.0.0.1:8383/components/FooComponent.html');

        driver.getTitle().then(function(title) {
            expect(title).to.equal('@compodoc/compodoc documentation');
        });

        driver.quit();
    };

// Chrome
test.describe('Chrome | Compodoc page', function() {
    test.it('should display title', function() {
        capabilities.browserName = 'chrome';
        capabilities.version = '56';
        testCode();
    });
});

// Chrome
test.describe('Firefox | Compodoc page', function() {
    test.it('should display title', function() {
        capabilities.browserName = 'firefox';
        capabilities.version = '51';
        testCode();
    });
});
