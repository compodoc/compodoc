const fs = require('fs');
const path = require('path');

const coverageDir = path.resolve(process.cwd(), 'coverage');
const outputFile = path.join(coverageDir, 'lcov_merged.info');

if (!fs.existsSync(coverageDir)) {
    console.error(`Coverage directory not found: ${coverageDir}`);
    process.exit(1);
}

const inputFiles = fs
    .readdirSync(coverageDir)
    .filter(fileName => /^lcov-.*\.info$/.test(fileName))
    .sort()
    .map(fileName => path.join(coverageDir, fileName));

if (inputFiles.length === 0) {
    console.error(`No lcov-*.info files found in ${coverageDir}`);
    process.exit(1);
}

const merged = inputFiles
    .map(fileName => fs.readFileSync(fileName, 'utf8').trimEnd())
    .filter(Boolean)
    .join('\n');

fs.writeFileSync(outputFile, `${merged}\n`);
console.log(`Merged ${inputFiles.length} LCOV file(s) into ${outputFile}`);
