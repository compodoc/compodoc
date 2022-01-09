import { Rule, SchematicContext, Tree, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const TSCONFIG_DATA = {
    include: ['src/**/*.ts'],
    exclude: ['src/**/*.spec.ts']
};

function safeReadJSON(path: string, tree: Tree) {
    try {
        return JSON.parse(tree.read(path)!.toString());
    } catch (e) {
        throw new SchematicsException(`Error when parsing ${path}: ${e.message}`);
    }
}

// Just return the tree
export function ngAdd(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        // Create tsconfig.doc.json file
        const tsconfigDocFile = 'tsconfig.doc.json';
        if (!tree.exists(tsconfigDocFile)) {
            tree.create(tsconfigDocFile, JSON.stringify(TSCONFIG_DATA));
        }
        // update package.json scripts
        const packageJsonFile = 'package.json';
        const packageJson = tree.exists(packageJsonFile) && safeReadJSON(packageJsonFile, tree);

        if (packageJson === undefined) {
            throw new SchematicsException('Could not locate package.json');
        }

        let packageScripts = {};
        if (packageJson['scripts']) {
            packageScripts = packageJson['scripts'];
        } else {
            packageScripts = {};
        }

        if (packageScripts) {
            packageScripts['compodoc:build'] = 'compodoc -p tsconfig.doc.json';
            packageScripts['compodoc:build-and-serve'] = 'compodoc -p tsconfig.doc.json -s';
            packageScripts['compodoc:serve'] = 'compodoc -s';
        }

        if (tree.exists(packageJsonFile)) {
            tree.overwrite(packageJsonFile, JSON.stringify(packageJson, null, 2));
        } else {
            tree.create(packageJsonFile, JSON.stringify(packageJson, null, 2));
        }

        // install package with npm
        context.addTask(new NodePackageInstallTask());
        return tree;
    };
}
