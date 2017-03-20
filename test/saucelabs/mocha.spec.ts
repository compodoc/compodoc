// RUN webdriver-manager start --standalone & npm run test:simple-doc before starting local test
var expect = require('chai').expect,
    webdriver = require('selenium-webdriver'),
    test = require('selenium-webdriver/testing'),
    username = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    capabilities:any = {
        'platform': 'WIN7'
    },
    server = '',
    testCode = function() {
        if (process.env.MODE_LOCAL === '0') {
            capabilities.username = username;
            capabilities.accessKey = accessKey;
            capabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
            capabilities.name = 'Compodoc test';
            capabilities.public = true;
            capabilities.build = process.env.TRAVIS_BUILD_NUMBER;
            server = 'http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub';
        }
        if (process.env.MODE_LOCAL === '1') {
            capabilities.platform = 'Linux';
            server = 'http://localhost:4444/wd/hub';
        }

        console.log(capabilities, server);

        driver = new webdriver.Builder()
        .withCapabilities(capabilities)
        .usingServer(server)
        .build();

        driver.get('http://127.0.0.1:8686/components/FooComponent.html');

        driver.getTitle().then(function(title) {
            expect(title).to.equal('@compodoc/compodoc documentation');
        });

        driver.quit();
    },
    driver;

// Chrome
test.describe('Chrome | Compodoc page', function() {
    test.it('should display title', function() {
        capabilities.browserName = 'chrome';
        capabilities.version = '56';
        testCode();
    });
});

// Firefox
test.describe('Firefox | Compodoc page', function() {
    test.it('should display title', function() {
        capabilities.browserName = 'firefox';
        capabilities.version = '51';
        testCode();
    });
});
