import * as fs from 'fs';
import * as os from 'os';

// Darwin kernel major version to macOS name mapping
const DARWIN_TO_MACOS: Record<number, string> = {
    20: 'Big Sur',
    21: 'Monterey',
    22: 'Ventura',
    23: 'Sonoma',
    24: 'Sequoia'
};

function getMacOsName(release: string): string {
    const major = Number(release.split('.')[0]);
    const prefix = major > 15 ? 'macOS' : 'OS X';
    const name = DARWIN_TO_MACOS[major];
    return prefix + (name ? ' ' + name : '');
}

function getLinuxPrettyName(): string {
    try {
        const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
        const match = osRelease.match(/^PRETTY_NAME=(?:"(.+?)"|'(.+?)'|(.+))$/m);
        const prettyName = match?.[1] ?? match?.[2] ?? match?.[3];
        if (prettyName) {
            return prettyName;
        }
    } catch {}

    return '';
}

export function osName(platform?: string, release?: string): string {
    if (!platform && release) {
        throw new Error("You can't specify a `release` without specifying `platform`");
    }

    platform = platform ?? os.platform();

    if (platform === 'darwin') {
        if (!release && os.platform() === 'darwin') {
            release = os.release();
        }
        return release ? getMacOsName(release) : 'macOS';
    }

    if (platform === 'linux') {
        if (!release && os.platform() === 'linux') {
            const prettyName = getLinuxPrettyName();
            if (prettyName) {
                return prettyName;
            }
            release = os.release();
        }
        const id = release ? release.replace(/^(\d+\.\d+).*/, '$1') : '';
        return 'Linux' + (id ? ' ' + id : '');
    }

    if (platform === 'win32') {
        // os.version() returns e.g. "Windows 10 Pro" on Windows
        if (os.platform() === 'win32') {
            return os.version();
        }
        return 'Windows' + (release ? ' ' + release : '');
    }

    return platform;
}
