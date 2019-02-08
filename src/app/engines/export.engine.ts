import Configuration from '../configuration';

import ExportJsonEngine from './export-json.engine';

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
        }
    }
}

export default ExportEngine.getInstance();
