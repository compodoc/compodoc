import * as path from 'path';

interface ScannedFile {
    name: string;
}

/**
 * Handle scan source code
 */
export class ScanFile {
    private static instance: ScanFile;

    private scannedFiles: ScannedFile[] = [];

    private constructor() {}

    public static getInstance() {
        if (!ScanFile.instance) {
            ScanFile.instance = new ScanFile();
        }
        return ScanFile.instance;
    }

    public async scan(folder) {
        const finder = require('findit2')('.');
        console.log(process.cwd());

        finder.on('directory', function(dir, stat, stop) {
            let base = path.basename(dir);
            if (base === '.git' || base === 'node_modules') {
                stop();
            }
        });

        finder.on('file', (file, stat) => {
            console.log(file);
            this.scannedFiles.push(file);
        });

        finder.on('end', () => {
            console.log('END');
            return this.scannedFiles;
        });
    }
}

export default ScanFile.getInstance();
