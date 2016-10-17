import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import {logger} from '../logger';

let pkg = require('PKG_PATH');
let program = require('commander');

export namespace Application {

  program
    .version(pkg.version)
      .option('-f, --file [file]', 'Entry *.ts file')
      .option('-o, --open', 'Open the generated documentation', false)
      .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
      .parse(process.argv);

  let outputHelp = () => {
    program.outputHelp()
    process.exit(1);
  }

  export let run = () => {

    let files = [];

    outputHelp();

  }
}
