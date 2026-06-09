export class RouteTreeMetrics {
    public countRoutes(routesTree: any): number {
        let count = 0;

        const walk = (node: any): void => {
            if (!node) {
                return;
            }

            if (Array.isArray(node)) {
                for (const child of node) {
                    walk(child);
                }
                return;
            }

            const hasLegacyPath = typeof node.path !== 'undefined' && node.kind !== 'module';
            const isStandaloneRouteNode =
                node.kind === 'route-path' || node.kind === 'route-redirect';

            if (hasLegacyPath || isStandaloneRouteNode) {
                count += 1;
            }

            if (node.children && Array.isArray(node.children)) {
                for (const child of node.children) {
                    walk(child);
                }
            }
        };

        walk(routesTree);
        return count;
    }
}
