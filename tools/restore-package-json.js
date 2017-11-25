const fs = require('fs-extra');

fs.copy('./package.json.old', './package.json', err => {
    if (err) return console.error(err);

    fs.remove('./package.json.old', err => {
        if (err) return console.error(err)
        console.log('Successfully restore package.json !');
    })
});
