import * as path from 'path';
import { glob } from 'tinyglobby';

export const EXCLUDE_PATTERNS = ['**/.git', '**/node_modules', '**/*.d.ts', '**/*.spec.ts'];

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
        this.scannedFiles = [];

        const files = await glob(pattern, {
            ignore: EXCLUDE_PATTERNS,
            absolute: true
        });

        files.forEach(file => {
            if (path.extname(file) === '.ts' || path.extname(file) === '.tsx') {
                this.scannedFiles.push(file);
            }
        });

        return this.scannedFiles;
    }
}

export default ScanFile.getInstance();
