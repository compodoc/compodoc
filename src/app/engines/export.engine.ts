import Configuration from '../configuration';

import ExportJsonEngine from './export-json.engine';
import ExportPdfEngine from './export-pdf.engine';

export class ExportEngine {
    private static instance: ExportEngine;
    private constructor() {}
    public static getInstance() {
        if (!ExportEngine.instance) {
            ExportEngine.instance = new ExportEngine();
        }
        return ExportEngine.instance;
    }

    public export(outputFolder, data) {
        switch (Configuration.mainData.exportFormat) {
            case 'json':
                return ExportJsonEngine.export(outputFolder, data);
            case 'pdf':
                return ExportPdfEngine.export(outputFolder);
        }
    }
}

export default ExportEngine.getInstance();
