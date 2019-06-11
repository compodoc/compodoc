export interface LiveServerConfiguration {
    root: string;
    open: boolean;
    quiet: boolean;
    logLevel: number;
    wait: number;
    host?: string;
    port: number;
}
