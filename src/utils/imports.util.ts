import * as path from 'path';
import * as ts from 'typescript';

import Ast, { PropertyDeclaration } from 'ts-simple-ast';

const ast = new Ast();

export class ImportsUtil {

    /**
     * Find for a sourceFile a variable value in a local enum
     * @param srcFile
     * @param variableName
     * @param variableValue
     */
    private findInEnums(srcFile, variableName: string, variableValue: string) {
        let res = '';
        srcFile.getEnum(e => {
            if (e.getName() === variableName) {
                e.getMember(m => {
                    if (m.getName() === variableValue) {
                        res = m.getValue();
                    }
                });
            }
        });
        return res;
    }

    /**
     * Find for a sourceFile a variable value in a local static class
     * @param srcFile
     * @param variableName
     * @param variableValue
     */
    private findInClasses(srcFile, variableName: string, variableValue: string) {
        let res = '';
        srcFile.getClass(c => {
            let staticProperty: PropertyDeclaration = c.getStaticProperty(variableValue);
            if (staticProperty) {
                if (staticProperty.getInitializer()) {
                    res = staticProperty.getInitializer().getText();
                }
            }
        });
        return res;
    }

    /**
     * Find a value in a local variable declaration like an object
     * @param variableDeclaration
     * @param variablesAttributes
     */
    private findInObjectVariableDeclaration(variableDeclaration, variablesAttributes) {
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
                        });
                    };
                    loopProperties(compilerNode.properties);
                    return finalValue;
                }
            }
        }
    }

    /**
     * Find in imports something like myvar
     * @param  {string} inputVariableName              like myvar
     * @return {[type]}                                myvar value
     */
    public findValueInImportOrLocalVariables(inputVariableName: string, sourceFile: ts.SourceFile) {
        let metadataVariableName = inputVariableName,
            searchedImport,
            aliasOriginalName = '',
            foundWithAlias = false;

        const file = (typeof ast.getSourceFile(sourceFile.fileName) !== 'undefined') ? ast.getSourceFile(sourceFile.fileName) : ast.addExistingSourceFile(sourceFile.fileName);// tslint:disable-line
        const imports = file.getImportDeclarations();

        /**
         * Loop through all imports, and find one matching inputVariableName
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

        if (typeof searchedImport !== 'undefined') {
            let importPath = path.resolve(path.dirname(sourceFile.fileName) + '/' + searchedImport.getModuleSpecifier() + '.ts');
            const sourceFileImport = (typeof ast.getSourceFile(importPath) !== 'undefined') ? ast.getSourceFile(importPath) : ast.addExistingSourceFile(importPath);// tslint:disable-line

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
        } else {
            // Find in local variables of the file
            const variableDeclaration = file.getVariableDeclaration(metadataVariableName);
            if (variableDeclaration) {
                return variableDeclaration.compilerNode;
            }
        }

        return [];
    }

    /**
     * Find in imports something like VAR.AVAR.BVAR.thestring
     * @param  {string} inputVariableName                   like VAR.AVAR.BVAR.thestring
     * @return {[type]}                                thestring value
     */
    public findPropertyValueInImportOrLocalVariables(inputVariableName, sourceFile: ts.SourceFile) {
        let variablesAttributes = inputVariableName.split('.'),
            metadataVariableName = variablesAttributes[0],
            searchedImport,
            aliasOriginalName = '',
            foundWithAlias = false;

        const file = (typeof ast.getSourceFile(sourceFile.fileName) !== 'undefined') ? ast.getSourceFile(sourceFile.fileName) : ast.addExistingSourceFile(sourceFile.fileName);// tslint:disable-line
        const imports = file.getImportDeclarations();

        /**
         * Loop through all imports, and find one matching inputVariableName
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

        let fileToSearchIn,
            variableDeclaration;
        if (typeof searchedImport !== 'undefined') {
            let imporPath = path.resolve(path.dirname(sourceFile.fileName) + '/' + searchedImport.getModuleSpecifier() + '.ts');
            const sourceFileImport = (typeof ast.getSourceFile(imporPath) !== 'undefined') ? ast.getSourceFile(imporPath) : ast.addExistingSourceFile(imporPath);// tslint:disable-line
            if (sourceFileImport) {
                fileToSearchIn = sourceFileImport;
                let variableName = (foundWithAlias) ? aliasOriginalName : metadataVariableName;
                variableDeclaration = fileToSearchIn.getVariableDeclaration(variableName);
            }
        } else {
            fileToSearchIn = file;
            // Find in local variables of the file
            variableDeclaration = fileToSearchIn.getVariableDeclaration(metadataVariableName);
        }

        if (variableDeclaration) {
            return this.findInObjectVariableDeclaration(variableDeclaration, variablesAttributes);
        }
        // Try find it in enums
        if (variablesAttributes.length > 0) {
            if (typeof fileToSearchIn !== 'undefined') {
                let val = this.findInEnums(fileToSearchIn, metadataVariableName, variablesAttributes[1]);
                if (val !== '') {
                    return val;
                }
                val = this.findInClasses(fileToSearchIn, metadataVariableName, variablesAttributes[1]);
                if (val !== '') {
                    return val;
                }
            }
        }
    }
}
