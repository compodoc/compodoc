const DEFAULT_EXCLUDED_EXTENSIONS = ['.d.ts', '.spec.ts'];

/**
 * Filter files
 */
export class FilterFiles {
    private static instance: FilterFiles;

    private filteredFiles: string[] = [];

    private constructor() {}

    public static getInstance() {
        if (!FilterFiles.instance) {
            FilterFiles.instance = new FilterFiles();
        }
        return FilterFiles.instance;
    }

    public filter(scannedFiles: string[], filesToExclude: string[]): string[] {
        /**
         * exclude can be toto.ts or *.module.ts
         */
        return [''];
    }
}

export default FilterFiles.getInstance();
