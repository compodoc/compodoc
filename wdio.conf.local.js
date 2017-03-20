const base = require('./wdio.conf.base')

exports.config = Object.assign({}, base.config, {
    capabilities: [{
            browserName: 'phantomjs'
        }
    ],
    services: ['phantomjs']
});
