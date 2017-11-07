import * as path from 'path';
import * as ts from 'typescript';

import Ast from 'ts-simple-ast';

const ast = new Ast();

export class ImportsUtil {
    public merge(variableName: string, sourceFile: ts.SourceFile) {
        let metadataVariableName = variableName,
            searchedImport,
            aliasOriginalName = '',
            foundWithAlias = false;

        const file = (typeof ast.getSourceFile(sourceFile.fileName) !== 'undefined') ? ast.getSourceFile(sourceFile.fileName) : ast.addSourceFileFromText(sourceFile.fileName, sourceFile.getText());
        const imports = file.getImports();

        /**
         * Loop through all imports, and find one matching variableName
         */
        imports.forEach((i) => {
            let namedImports = i.getNamedImports(),
                namedImportsLength = namedImports.length,
                j = 0;

            if (namedImportsLength > 0) {
                for (j; j<namedImportsLength; j++) {
                    let importName = namedImports[j].getNameIdentifier().getText() as string,
                        importAlias;

                    if (namedImports[j].getAliasIdentifier()) {
                        importAlias = namedImports[j].getAliasIdentifier().getText();
                    }
                    if (importName === metadataVariableName) {
                        searchedImport = i;
                        break;
                    }
                    if (importAlias === metadataVariableName) {
                        foundWithAlias = true;
                        aliasOriginalName = importName;
                        searchedImport = i;
                        break;
                    }
                }
            }
        });

        if (searchedImport) {
            let imporPath = path.resolve(path.dirname(sourceFile.fileName) + '/' + searchedImport.getModuleSpecifier() + '.ts');
            const sourceFileImport = ast.getOrAddSourceFile(imporPath);
            if (sourceFileImport) {
                let variableName = (foundWithAlias) ? aliasOriginalName : metadataVariableName;
                let variableDeclaration = sourceFileImport.getVariableDeclaration(variableName);
                if (variableDeclaration) {
                    let variableKind = variableDeclaration.getKind();

                    if (variableKind && variableKind === ts.SyntaxKind.VariableDeclaration) {
                        let initializer = variableDeclaration.getInitializer();
                        if (initializer) {
                            let initializerKind = initializer.getKind();
                            if (initializerKind && initializerKind === ts.SyntaxKind.ObjectLiteralExpression) {
                                return initializer.compilerNode.properties;
                            }
                        }
                    }
                }
            }
        }

        return [];
    }
}
