export class HandleTsconfigFile {
    private static instance: HandleTsconfigFile;

    constructor() {}

    public static getInstance() {
        if (!HandleTsconfigFile.instance) {
            HandleTsconfigFile.instance = new HandleTsconfigFile();
        }
        return HandleTsconfigFile.instance;
    }

    public handle() {}
}

export default HandleTsconfigFile.getInstance();
