var https = require('https'),
    fs = require('fs'),
    options = {
        hostname: 'angular.io',
        path: '/docs/ts/latest/api/api-list.json',
        method: 'GET'
    },

    file = fs.createWriteStream('src/data/api-list.json'),

    req = https.request(options, function(res) {
        if (res.statusCode === 200) {
            console.log('Download ok');
        }
        res.on('data', function(d) {
            file.write(d);
        });
    });

req.end();

req.on('error', function(e) {
    console.error(e);
});
