import ScanFile from './core/use-cases/scan-files';

export class CliApplication {
    public async start() {
        let files;
        ScanFile.scan('').then(scannedFiles => {
            files = scannedFiles;
            console.log(files);
        });
    }
}
