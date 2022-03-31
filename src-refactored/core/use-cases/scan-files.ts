import * as path from 'path';
import * as fg from 'fast-glob';

export const EXCLUDE_PATTERNS = [
    '**/.git',
    '**/node_modules',
    '**/*.d.ts',
    '**/*.spec.ts'
];

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

    public async scan(folder: string): Promise<string[]> {
        const pattern = `${path.resolve(folder)}/**/*.{ts,tsx}`;

        return new Promise<string[]>((resolve, reject) => {
            const stream = fg.stream(pattern, {
                ignore: EXCLUDE_PATTERNS,
                absolute: true
            })

            stream.on('error', error => {
                reject(error);
            });

            stream.on('data', (file) => {
                if (path.extname(file) === '.ts' || path.extname(file) === '.tsx') {
                    this.scannedFiles.push(file);
                }
            });

            stream.on('end', () => {
                resolve(this.scannedFiles);
            });
        });
    }
}

export default ScanFile.getInstance();
