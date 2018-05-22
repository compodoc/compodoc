// RUN webdriver-manager start --standalone & npm run test:simple-doc before starting local test
const expect = require('chai').expect;
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const request = require('request');

let username = process.env.SAUCE_USERNAME;
let accessKey = process.env.SAUCE_ACCESS_KEY;
let capabilities: any = {
    'platform': 'WIN7'
};
let server = '';
let startDriver = function (cb, pageUrl) {
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

    capabilities.recordVideo = false;

    driver = new webdriver.Builder()
        .withCapabilities(capabilities)
        .usingServer(server)
        .build();

    driver.getSession().then(function (sessionid) {
        driver.sessionID = sessionid.id_;
    });

    driver.get(pageUrl).then(function () {
        cb();
    });
};
let handleStatus = function (tests) {
    let status = false;
    for (let i = 0; i < tests.length; i++) {
        if (tests[i].state === 'passed') {
            status = true;
        }
    }
    return status;
};
let writeScreenshot = function (data, name) {
    fs.writeFile('out.png', data, 'base64', function (err) {
        if (err) { console.log(err); }
    });
};
let endTests = function (context, cb) {
    if (process.env.MODE_LOCAL === '0') {
        let result = handleStatus(context.test.parent.tests);
        request({
            method: 'PUT',
            uri: `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${driver.sessionID}`,
            json: {
                passed: result
            }
        }, function (error, response, body) {
            driver.quit().then(cb);
        });
    } else {
        driver.quit().then(cb);
    }
};
let testSearchBarWithResults = function (cb) {
    let searchBox;
    driver
        .findElements(webdriver.By.xpath("//div[@id='book-search-input']/input"))
        .then(function (elems) {
            searchBox = elems[1]; // First one is the mobile one hidden;
            searchBox.sendKeys('exampleInput');
            driver.sleep(1000).then(function() {
                searchBox.getAttribute('value').then(function (value) {
                    expect(value).to.equal('exampleInput');

                    /*driver.takeScreenshot().then(function (data) {
                        writeScreenshot(data, 'test.png');
                    });*/

                    driver.sleep(1000).then(function() {
                        driver
                            .findElements(webdriver.By.className('search-results-item'))
                            .then(function (elems) {
                                expect(elems.length).to.equal(1);
                                driver.sleep(1000).then(function() {
                                    cb();
                                });
                            });
                    });
                });
            });
        });
};
let testSearchBarWithNoResults = function (cb) {
    let searchBox;
    driver
        .findElements(webdriver.By.xpath("//div[@id='book-search-input']/input"))
        .then(function (elems) {
            searchBox = elems[1]; // First one is the mobile one hidden;
            searchBox.clear();
            driver.sleep(1000).then(function() {
                searchBox.sendKeys('waza');
                driver.sleep(1000).then(function() {
                    searchBox.getAttribute('value').then(function (value) {
                        expect(value).to.equal('waza');
                        driver.sleep(4000).then(function() {
                            driver
                                .findElements(webdriver.By.className('search-results-item'))
                                .then(function (elems1) {
                                    expect(elems1.length).to.equal(0);
                                    driver.sleep(1000).then(function() {
                                        cb();
                                    });
                                });
                        });
                    });
                });
            });
        });
};
let driver;

// Cannot connect to localhost...
describe('WIN 10 | Edge | Compodoc page', function () {
    before(function (done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'MicrosoftEdge';
        capabilities.version = '17.17134';
        startDriver(done, 'http://localhost:5000/components/FooComponent.html');
    });
    // Test search bar
    it('should have a search bar, and handle results', function (done) {
        testSearchBarWithResults(done);
    });
    it('should have a search bar, and handle results empty', function (done) {
        testSearchBarWithNoResults(done);
    });
    // TODO : test routing
    after(function (done) {
        endTests(this, done);
    });
});

describe('Mac El Capitan | Safari 10 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'OS X 10.11';
        capabilities.browserName = 'safari';
        capabilities.version = '10.0';
        startDriver(done, 'http://localhost:5000/components/FooComponent.html');
    });
    // Test search bar
    it('should have a search bar, and handle results', function(done) {
        testSearchBarWithResults(done);
    });
    it('should have a search bar, and handle results empty', function(done) {
        testSearchBarWithNoResults(done);
    });
    // TODO : test routing
    after(function(done) {
        endTests(this, done);
    });
});