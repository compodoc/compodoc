import { spawn } from 'child_process';
import * as path from 'path';

const polka = require('polka');
const sirv = require('sirv');

export interface DocumentationServerConfiguration {
    root: string;
    open?: boolean;
    host?: string;
    port: number;
}

function getBrowserHost(host?: string): string {
    if (!host || host === '0.0.0.0' || host === '::') {
        return 'localhost';
    }
    if (host.includes(':') && !host.startsWith('[')) {
        return `[${host}]`;
    }
    return host;
}

function getServerUrl(configuration: DocumentationServerConfiguration): string {
    return `http://${getBrowserHost(configuration.host)}:${configuration.port}`;
}

function openInBrowser(url: string): void {
    let command = 'xdg-open';
    let args = [url];

    if (process.platform === 'darwin') {
        command = 'open';
    } else if (process.platform === 'win32') {
        command = 'cmd';
        args = ['/c', 'start', '', url];
    }

    const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore'
    });

    child.on('error', () => {});
    child.unref();
}

export function startDocumentationServer(configuration: DocumentationServerConfiguration): any {
    const app = polka();
    const root = path.resolve(configuration.root);
    const serveStatic = sirv(root, { dev: true });
    const onListening = () => {
        if (configuration.open) {
            openInBrowser(getServerUrl(configuration));
        }
    };

    app.use(serveStatic);

    if (configuration.host) {
        return app.listen(configuration.port, configuration.host, onListening);
    }

    return app.listen(configuration.port, onListening);
}
