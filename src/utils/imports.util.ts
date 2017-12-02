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
                    let importName = namedImports[j].getNameNode().getText() as string,
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
                                let compilerNode = initializer.compilerNode as ts.ObjectLiteralExpression;
                                return compilerNode.properties;
                            }
                        }
                    }
                }
            }
        }

        return [];
    }

    /**
     * Find in imports something like VAR.AVAR.BVAR.thestring
     * @param  {string} variableName                   like VAR.AVAR.BVAR.thestring
     * @return {[type]}                                thestring value
     */
    public findPropertyValueInImport(variableName, sourceFile: ts.SourceFile) {
        let variablesAttributes = variableName.split('.'),
            metadataVariableName = variablesAttributes[0],
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
                    let importName = namedImports[j].getNameNode().getText() as string,
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

        let findInVariableDeclaration = (variableDeclaration) => {
            let variableKind = variableDeclaration.getKind();
            if (variableKind && variableKind === ts.SyntaxKind.VariableDeclaration) {
                let initializer = variableDeclaration.getInitializer();
                if (initializer) {
                    let initializerKind = initializer.getKind();
                    if (initializerKind && initializerKind === ts.SyntaxKind.ObjectLiteralExpression) {
                        let compilerNode = initializer.compilerNode as ts.ObjectLiteralExpression,
                            finalValue = '';
                        // Find thestring from AVAR.BVAR.thestring inside properties
                        let depth = 0;
                        let loopProperties = (properties) => {
                            properties.forEach(prop => {
                                if (prop.name) {
                                    if (variablesAttributes[depth + 1]) {
                                        if (prop.name.getText() === variablesAttributes[depth + 1]) {
                                            if (prop.initializer) {
                                                if (prop.initializer.properties) {
                                                    depth += 1;
                                                    loopProperties(prop.initializer.properties);
                                                } else {
                                                    finalValue = prop.initializer.text;
                                                }
                                            } else {
                                                finalValue = prop.initializer.text;
                                            }
                                        }
                                    }
                                }
                            })
                        };
                        loopProperties(compilerNode.properties);
                        return finalValue;
                    }
                }
            }
        };

        let findInEnums = (sourceFile, variableName: string, variableValue: string) => {
            let res = '';
            sourceFile.getEnum(e => {
                if (e.getName() === variableName) {
                    e.getMember(m => {
                        if (m.getName() === variableValue) {
                            res = m.getValue();
                        }
                    });
                }
            });
            return res;
        };

        if (typeof searchedImport !== 'undefined') {
            let imporPath = path.resolve(path.dirname(sourceFile.fileName) + '/' + searchedImport.getModuleSpecifier() + '.ts');
            const sourceFileImport = ast.getOrAddSourceFile(imporPath);
            if (sourceFileImport) {
                let variableName = (foundWithAlias) ? aliasOriginalName : metadataVariableName;
                let variableDeclaration = sourceFileImport.getVariableDeclaration(variableName);
                if (variableDeclaration) {
                    return findInVariableDeclaration(variableDeclaration);
                }
                // Try find it in enums
                if (variablesAttributes.length > 0) {
                    let en = findInEnums(sourceFileImport, metadataVariableName, variablesAttributes[1]);
                    if (en !== '') {
                        return en;
                    }
                }
            }
        } else {
            // Find in local variables of the file
            const variableStatements = file.getVariableStatements();
            const variableDeclaration = file.getVariableDeclaration(metadataVariableName);
            if (variableDeclaration) {
                return findInVariableDeclaration(variableDeclaration);
            }
            // Try find it in enums
            if (variablesAttributes.length > 0) {
                let en = findInEnums(file, metadataVariableName, variablesAttributes[1]);
                if (en !== '') {
                    return en;
                }
            }
        }
    }
}
