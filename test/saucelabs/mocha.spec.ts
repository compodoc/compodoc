// RUN webdriver-manager start --standalone & npm run test:simple-doc before starting local test
var expect = require('chai').expect,
    fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    request = require('request'),
    username = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    capabilities: any = {
        'platform': 'WIN7'
    },
    server = '',
    startDriver = function(cb, pageUrl) {
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

        driver = new webdriver.Builder()
            .withCapabilities(capabilities)
            .usingServer(server)
            .build();

        driver.getSession().then(function(sessionid) {
            driver.sessionID = sessionid.id_;
        });

        driver.get(pageUrl).then(function() {
            cb();
        });
    },
    handleStatus = function(tests) {
        var status = false;
        for (var i = 0; i < tests.length; i++) {
            if (tests[i].state === 'passed') {
                status = true;
            }
        }
        return status;
    },
    writeScreenshot = function(data, name) {
        fs.writeFile('out.png', data, 'base64', function(err) {
            if (err) console.log(err);
        });
    },
    endTests = function(context, cb) {
        if (process.env.MODE_LOCAL === '0') {
            var result = handleStatus(context.test.parent.tests);
            request({
                method: 'PUT',
                uri: `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${driver.sessionID}`,
                json: {
              		passed: result
            	}
            }, function(error, response, body) {
                driver.quit().then(cb);
            });
        } else {
            driver.quit().then(cb);
        }
    },
    testSearchBarWithResults = function(cb) {
        var searchBox
        driver
            .findElements(webdriver.By.xpath("//div[@id='book-search-input']/input"))
            .then(function(elems) {
                searchBox = elems[1]; //First one is the mobile one hidden;
                searchBox.sendKeys('exampleInput');
                searchBox.getAttribute('value').then(function(value) {
                    expect(value).to.equal('exampleInput');

                    /*driver.takeScreenshot().then(function (data) {
                        writeScreenshot(data, 'test.png');
                    });*/

                    driver
                        .findElements(webdriver.By.className('search-results-item'))
                        .then(function(elems) {
                            expect(elems.length).to.equal(1);
                            cb();
                        });
                });
            });
    },
    testSearchBarWithNoResults = function(cb) {
        var searchBox
        driver
            .findElements(webdriver.By.xpath("//div[@id='book-search-input']/input"))
            .then(function(elems) {
                searchBox = elems[1]; //First one is the mobile one hidden;
                searchBox.clear();
                searchBox.sendKeys('waza');
                searchBox.getAttribute('value').then(function(value) {
                    expect(value).to.equal('waza');

                    driver
                        .findElements(webdriver.By.className('search-results-item'))
                        .then(function(elems) {
                            expect(elems.length).to.equal(0);
                            cb();
                        });
                });
            });
    },
    driver;

// Chrome
describe('Chrome | Compodoc page', function() {

    before(function(done) {
        capabilities.browserName = 'chrome';
        capabilities.version = '56';

        startDriver(done, 'http://127.0.0.1:8383/components/FooComponent.html');
    });

    it('should display title', function(done) {
        driver.getTitle().then(function(title) {
            expect(title).to.equal('@compodoc/compodoc documentation');
            done();
        });
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

// Firefox
describe('Firefox | Compodoc page', function() {

    before(function(done) {
        capabilities.browserName = 'firefox';
        capabilities.version = '51';

        startDriver(done, 'http://127.0.0.1:8383/components/FooComponent.html');
    });

    it('should display title', function(done) {
        driver.getTitle().then(function(title) {
            expect(title).to.equal('@compodoc/compodoc documentation');
            done();
        });
    });

    after(function(done) {
        if (process.env.MODE_LOCAL === '0') {
            var result = handleStatus(this.test.parent.tests);
            request({
                method: 'PUT',
                uri: `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${driver.sessionID}`,
                json: {
              		passed: result
            	}
            }, function(error, response, body) {
                driver.quit().then(done);
            });
        } else {
            driver.quit().then(done);
        }
    });
});

// IE
describe('IE | Compodoc page', function() {

    before(function(done) {
        capabilities.browserName = 'internet explorer';
        capabilities.version = '11';

        startDriver(done, 'http://127.0.0.1:8383/components/FooComponent.html');
    });

    it('should display title', function(done) {
        driver.getTitle().then(function(title) {
            expect(title).to.equal('@compodoc/compodoc documentation');
            done();
        });
    });

    after(function(done) {
        if (process.env.MODE_LOCAL === '0') {
            var result = handleStatus(this.test.parent.tests);
            request({
                method: 'PUT',
                uri: `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${driver.sessionID}`,
                json: {
              		passed: result
            	}
            }, function(error, response, body) {
                driver.quit().then(done);
            });
        } else {
            driver.quit().then(done);
        }
    });
});

// Safari
describe('Safari | Compodoc page', function() {

    before(function(done) {
        capabilities.browserName = 'safari';
        capabilities.version = '5';

        startDriver(done, 'http://127.0.0.1:8383/components/FooComponent.html');
    });

    it('should display title', function(done) {
        driver.getTitle().then(function(title) {
            expect(title).to.equal('@compodoc/compodoc documentation');
            done();
        });
    });

    after(function(done) {
        if (process.env.MODE_LOCAL === '0') {
            var result = handleStatus(this.test.parent.tests);
            request({
                method: 'PUT',
                uri: `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${driver.sessionID}`,
                json: {
              		passed: result
            	}
            }, function(error, response, body) {
                driver.quit().then(done);
            });
        } else {
            driver.quit().then(done);
        }
    });
});
