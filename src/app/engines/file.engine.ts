import * as fs from 'fs-extra';
import * as path from 'path';

export class FileEngine {
    public get(file: string): Promise<string> {
        return this.getAbsolute(process.cwd() + path.sep + file);
    }

    public getAbsolute(filepath: string): Promise<string> {
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

    public write(file: string, contents: string): Promise<void> {
        return this.writeAbsolute(process.cwd() + path.sep + file, contents);
    }

    public writeAbsolute(filepath: string, contents: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.outputFile(path.resolve(filepath), contents, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
