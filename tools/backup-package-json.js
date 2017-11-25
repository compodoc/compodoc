const fs = require('fs-extra');

fs.copy('./package.json', './package.json.old', err => {
    if (err) return console.error(err);


    fs.readJson('./package.json')
        .then(packageObj => {
            let packageData = packageObj;
            delete packageData.devDependencies;
            delete packageData.nyc;
            delete packageData.watch;

            fs.outputFile('./package.json', JSON.stringify(packageData, null, 4), err => {
                console.log(err) // => null
                console.log('Successfully backup package.json !');
            });
        })
        .catch(err => {
          console.error(err)
        })
});
