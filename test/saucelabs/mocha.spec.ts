var expect = require('chai').expect,
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver'),
    username = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY;

test.describe('Google Search', function() {
    test.it('should work', function() {
        var driver = new webdriver.Builder()
            .withCapabilities({
                'browserName': 'chrome',
                'platform': 'Windows XP',
                'version': '43.0',
                'username': username,
                'accessKey': accessKey,
                'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
                name: 'Compodoc test',
                'public': true,
                build: process.env.TRAVIS_BUILD_NUMBER
            })
            .usingServer("http://" + username + ":" + accessKey + "@ondemand.saucelabs.com:80/wd/hub")
            .build();
        driver.get('http://127.0.0.1:8383');

        driver.getTitle().then(function(title) {
            expect(title).to.equal('compodoc documentation');
        });

        driver.quit();
    });
});
