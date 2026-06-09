export function clearModuleCache(moduleName: string): void {
    try {
        delete require.cache[require.resolve(moduleName)];
    } catch (_error) {
        // Module is not loaded or cannot be resolved.
    }
}
