import * as fs from 'fs-extra';
import * as path from 'path';

export class FileEngine {
    public get(filepath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(filepath), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                } else {
                    resolve(data);
                }
            });
        });
    }

    public write(filepath: string, contents: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.outputFile(path.resolve(filepath), contents, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public getSync(filepath: string): string {
        return fs.readFileSync(path.resolve(filepath), 'utf8');
    }

    /**
     * @param file The file to check
     */
    public existsSync(file: string): boolean {
        return fs.existsSync(file);
    }
}
