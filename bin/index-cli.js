#! /usr/bin/env node

var cd = require('../dist/index-cli.js'),
    cdI = new cd.CliApplication();

cdI.generate();
