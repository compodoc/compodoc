import * as path from 'path';

interface ScannedFile {
    name: string;
}

/**
 * Handle scan source code
 */
export class ScanFile {
    private static instance: ScanFile;

    private scannedFiles: string[] = [];

    private constructor() {}

    public static getInstance() {
        if (!ScanFile.instance) {
            ScanFile.instance = new ScanFile();
        }
        return ScanFile.instance;
    }

    public async scan(folder): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const finder = require('findit2')(path.resolve(folder));

            finder.on('directory', function(dir, stat, stop) {
                let base = path.basename(dir);
                if (base === '.git' || base === 'node_modules') {
                    stop();
                }
            });

            finder.on('error', error => {
                reject(error);
            });

            finder.on('file', (file, stat) => {
                if (path.extname(file) === '.ts') {
                    this.scannedFiles.push(file);
                }
            });

            finder.on('end', () => {
                resolve(this.scannedFiles);
            });
        });
    }
}

export default ScanFile.getInstance();
