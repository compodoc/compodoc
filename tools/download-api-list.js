const https = require('https');
const fs = require('fs');

const API_LIST_URL =
    process.env.ANGULAR_API_LIST_URL || 'https://angular.io/generated/docs/api/api-list.json';
const OUTPUT_PATH = 'src/data/api-list.json';

function download(url) {
    https
        .get(url, res => {
            // Follow redirects if endpoint changes.
            if (
                res.statusCode &&
                res.statusCode >= 300 &&
                res.statusCode < 400 &&
                res.headers.location
            ) {
                return download(res.headers.location);
            }

            if (res.statusCode !== 200) {
                console.error(`Download failed with status ${res.statusCode} for ${url}`);
                res.resume();
                process.exitCode = 1;
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const body = Buffer.concat(chunks).toString('utf8');
                    JSON.parse(body);
                    fs.writeFileSync(OUTPUT_PATH, body, 'utf8');
                    console.log(`Download ok (${OUTPUT_PATH})`);
                } catch (error) {
                    console.error(`Invalid JSON received from ${url}`);
                    console.error(error);
                    process.exitCode = 1;
                }
            });
        })
        .on('error', error => {
            console.error(error);
            process.exitCode = 1;
        });
}

download(API_LIST_URL);
