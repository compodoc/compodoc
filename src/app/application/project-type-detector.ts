import * as path from 'node:path';

export class ProjectTypeDetector {
    public isAngularJSProject(packageJsonData: any, files: string[]): boolean {
        if (typeof packageJsonData.dependencies === 'undefined') {
            return false;
        }

        if (typeof packageJsonData.dependencies.angular !== 'undefined') {
            return true;
        }

        const javascriptFileCount = files.filter(file => path.extname(file) === '.js').length;
        const javascriptFileRatio = (javascriptFileCount * 100) / files.length;

        return javascriptFileRatio >= 75;
    }
}
