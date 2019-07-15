import { cosmiconfig } from 'cosmiconfig';

export class HandleConfigFile {
    private static instance: HandleConfigFile;

    private cosmiconfigModuleName = 'compodoc';

    private configExplorer;

    constructor() {
        this.configExplorer = cosmiconfig(this.cosmiconfigModuleName);
    }

    public static getInstance() {
        if (!HandleConfigFile.instance) {
            HandleConfigFile.instance = new HandleConfigFile();
        }
        return HandleConfigFile.instance;
    }

    public handle() {}
}

export default HandleConfigFile.getInstance();
