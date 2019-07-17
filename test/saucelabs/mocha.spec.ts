// RUN webdriver-manager start --standalone & npm run test:simple-doc before starting local test
const expect = require('chai').expect;
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const request = require('request');

let username = process.env.SAUCE_USERNAME;
let accessKey = process.env.SAUCE_ACCESS_KEY;
let capabilities: any = {
    platform: 'WIN7'
};
let server = '';
let startDriver = function(cb, pageUrl) {
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

    driver.getSession().then(function(sessionid) {
        driver.sessionID = sessionid.id_;
    });

    driver.get(pageUrl).then(function() {
        cb();
    });
};
let handleStatus = function(tests) {
    let status = false;
    for (let i = 0; i < tests.length; i++) {
        if (tests[i].state === 'passed') {
            status = true;
        }
    }
    return status;
};
let writeScreenshot = function(data, name) {
    fs.writeFile('out.png', data, 'base64', function(err) {
        if (err) {
            console.log(err);
        }
    });
};
let endTests = function(context, cb) {
    if (process.env.MODE_LOCAL === '0') {
        let result = handleStatus(context.test.parent.tests);
        request(
            {
                method: 'PUT',
                uri: `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/jobs/${driver.sessionID}`,
                json: {
                    passed: result
                }
            },
            function(error, response, body) {
                driver.quit().then(cb);
            }
        );
    } else {
        driver.quit().then(cb);
    }
};
let testSearchBarWithResults = function(cb) {
    let searchBox;
    driver
        .findElements(webdriver.By.xpath("//div[@id='book-search-input']/input"))
        .then(function(elems) {
            searchBox = elems[1]; // First one is the mobile one hidden;
            searchBox.sendKeys('exampleInput');
            driver.sleep(2000).then(function() {
                searchBox.getAttribute('value').then(function(value) {
                    expect(value).to.equal('exampleInput');

                    /*driver.takeScreenshot().then(function (data) {
                        writeScreenshot(data, 'test.png');
                    });*/

                    driver.sleep(2000).then(function() {
                        driver
                            .findElements(webdriver.By.className('search-results-item'))
                            .then(function(elems) {
                                expect(elems.length).to.equal(1);
                                driver.sleep(2000).then(function() {
                                    cb();
                                });
                            });
                    });
                });
            });
        });
};
let testSearchBarWithNoResults = function(cb) {
    let searchBox;
    driver
        .findElements(webdriver.By.xpath("//div[@id='book-search-input']/input"))
        .then(function(elems) {
            searchBox = elems[1]; // First one is the mobile one hidden;
            searchBox.clear();
            driver.sleep(2000).then(function() {
                searchBox.sendKeys('waza');
                driver.sleep(2000).then(function() {
                    searchBox.getAttribute('value').then(function(value) {
                        expect(value).to.equal('waza');
                        driver.sleep(4000).then(function() {
                            driver
                                .findElements(webdriver.By.className('search-results-item'))
                                .then(function(elems1) {
                                    expect(elems1.length).to.equal(0);
                                    driver.sleep(2000).then(function() {
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

/**
 * WIN 10
 */

describe('WIN 10 | Edge 18 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'MicrosoftEdge';
        capabilities.version = '18.17763';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 10 | Edge 17 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'MicrosoftEdge';
        capabilities.version = '17.17134';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 10 | Edge 16 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'MicrosoftEdge';
        capabilities.version = '16.16299';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/*
describe('WIN 10 | IE | Compodoc page', function () {
    before(function (done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'internet explorer';
        capabilities.version = '11.103';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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
});*/

describe('WIN 10 | Firefox 65 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'firefox';
        capabilities.version = '65.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 10 | Firefox 62 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'firefox';
        capabilities.version = '62.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 10 | Chrome 72 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'chrome';
        capabilities.version = '72.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 10 | Chrome 48 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 10';
        capabilities.browserName = 'chrome';
        capabilities.version = '48.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/**
 * WIN 8
 */

describe('WIN 8 | Chrome 72 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 8';
        capabilities.browserName = 'chrome';
        capabilities.version = '72.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 8 | Firefox 65 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 8';
        capabilities.browserName = 'firefox';
        capabilities.version = '65.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/**
 * WIN 7
 */

describe('WIN 7 | Chrome 72 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Windows 7';
        capabilities.browserName = 'chrome';
        capabilities.version = '72.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('WIN 7 | Firefox 65 | Compodoc page', function() {
    before(function(done) {
        capabilities.browserName = 'firefox';
        capabilities.version = '65.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/*describe('WIN 7 | IE | Compodoc page', function() {
    before(function(done) {
        capabilities.browserName = 'internet explorer';
        capabilities.version = '11';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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
*/

/**
 * LINUX
 */

describe('Linux | Firefox 45 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Linux';
        capabilities.browserName = 'firefox';
        capabilities.version = '45.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Linux | Chrome 48 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'Linux';
        capabilities.browserName = 'chrome';
        capabilities.version = '48.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/**
 * Mac High Sierra
 */

describe('Mac High Sierra | Safari 11.1 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'macOS 10.13';
        capabilities.browserName = 'safari';
        capabilities.version = '11.1';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Mac High Sierra | Firefox 65 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'macOS 10.13';
        capabilities.browserName = 'firefox';
        capabilities.version = '65.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Mac High Sierra | Chrome 72 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'macOS 10.13';
        capabilities.browserName = 'chrome';
        capabilities.version = '72.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/**
 * Mac Sierra
 */

describe('Mac Sierra | Safari 11 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'macOS 10.12';
        capabilities.browserName = 'safari';
        capabilities.version = '11.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Mac Sierra | Firefox 65 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'macOS 10.12';
        capabilities.browserName = 'firefox';
        capabilities.version = '65.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Mac Sierra | Chrome 72 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'macOS 10.12';
        capabilities.browserName = 'chrome';
        capabilities.version = '72.0';

        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

/**
 * Mac El Capitan
 */

describe('Mac El Capitan | Safari 10 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'OS X 10.11';
        capabilities.browserName = 'safari';
        capabilities.version = '10.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Mac El Capitan | Chrome 72 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'OS X 10.11';
        capabilities.browserName = 'chrome';
        capabilities.version = '72.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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

describe('Mac El Capitan | Firefox 65 | Compodoc page', function() {
    before(function(done) {
        capabilities.platform = 'OS X 10.11';
        capabilities.browserName = 'chrome';
        capabilities.version = '65.0';
        startDriver(done, 'http://localhost:4000/components/FooComponent.html');
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
