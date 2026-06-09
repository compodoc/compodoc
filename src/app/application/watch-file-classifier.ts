import * as path from 'node:path';

export class WatchFileClassifier {
    public hasTypeScriptFile(files: string[]): boolean {
        return files.some(file => path.extname(file) === '.ts');
    }

    public hasRootMarkdownFile(files: string[], rootDirectory: string): boolean {
        return files.some(
            file => path.extname(file) === '.md' && path.dirname(file) === rootDirectory
        );
    }
}
