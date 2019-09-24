import * as fs from 'fs-extra';
import * as path from 'path';

export class FileEngine {
    private static instance: FileEngine;

    private constructor() {}

    public static getInstance() {
        if (!FileEngine.instance) {
            FileEngine.instance = new FileEngine();
        }
        return FileEngine.instance;
    }

    /**
     * Read async proxy
     * @param filepath Path of the file to read
     */
    public async get(filepath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path.resolve(filepath), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Read sync proxy
     * @param filepath Path of the file to read
     */
    public getSync(filepath: string): string {
        return fs.readFileSync(path.resolve(filepath), 'utf8');
    }

    /**
     * Async write content to file
     * @param filepath Path of the file to write
     * @param contents Content of the file to write
     */
    public async write(filepath: string, contents: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.outputFile(path.resolve(filepath), contents, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Sync write content to file
     * @param filepath Path of the file to write
     * @param contents Content of the file to write
     */
    public writeSync(filepath: string, contents: string): void {
        fs.outputFileSync(filepath, contents);
    }

    /**
     * Sync check file exist
     * @param file The file to check
     */
    public existsSync(file: string): boolean {
        return fs.existsSync(file);
    }
}

export default FileEngine.getInstance();
