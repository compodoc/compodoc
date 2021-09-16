import * as path from 'path';

import { Project, ts, PropertyDeclaration, SyntaxKind, VariableDeclaration } from 'ts-morph';
import FileEngine from '../app/engines/file.engine';

const ast = new Project();

export class ImportsUtil {
    private static instance: ImportsUtil;
    private constructor() {}
    public static getInstance() {
        if (!ImportsUtil.instance) {
            ImportsUtil.instance = new ImportsUtil();
        }
        return ImportsUtil.instance;
    }
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
        if (variableKind && variableKind === SyntaxKind.VariableDeclaration) {
            let initializer = variableDeclaration.getInitializer();
            if (initializer) {
                let initializerKind = initializer.getKind();
                if (initializerKind && initializerKind === SyntaxKind.ObjectLiteralExpression) {
                    let compilerNode = initializer.compilerNode as ts.ObjectLiteralExpression,
                        finalValue = '';
                    // Find thestring from AVAR.BVAR.thestring inside properties
                    let depth = 0;
                    let loopProperties = properties => {
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
    public findValueInImportOrLocalVariables(
        inputVariableName: string,
        sourceFile: ts.SourceFile,
        decoratorType?: string
    ) {
        let metadataVariableName = inputVariableName,
            searchedImport,
            aliasOriginalName = '',
            foundWithNamedImport = false,
            foundWithDefaultImport = false,
            foundWithAlias = false;

        const file =
            typeof ast.getSourceFile(sourceFile.fileName) !== 'undefined'
                ? ast.getSourceFile(sourceFile.fileName)
                : ast.addSourceFileAtPathIfExists(sourceFile.fileName); // tslint:disable-line
        const imports = file.getImportDeclarations();

        /**
         * Loop through all imports, and find one matching inputVariableName
         */
        imports.forEach(i => {
            let namedImports = i.getNamedImports(),
                namedImportsLength = namedImports.length,
                j = 0;

            if (namedImportsLength > 0) {
                for (j; j < namedImportsLength; j++) {
                    let importName = namedImports[j].getNameNode().getText() as string,
                        importAlias;

                    if (namedImports[j].getAliasNode()) {
                        importAlias = namedImports[j].getAliasNode().getText();
                    }
                    if (importName === metadataVariableName) {
                        foundWithNamedImport = true;
                        searchedImport = i;
                        break;
                    }
                    if (importAlias === metadataVariableName) {
                        foundWithNamedImport = true;
                        foundWithAlias = true;
                        aliasOriginalName = importName;
                        searchedImport = i;
                        break;
                    }
                }
            }
            const namespaceImport = i.getNamespaceImport();
            if (namespaceImport) {
                const namespaceImportLocalName = namespaceImport.getText();
                if (namespaceImportLocalName === metadataVariableName) {
                    searchedImport = i;
                }
            }

            if (!foundWithNamedImport) {
                const defaultImport = i.getDefaultImport();
                if (defaultImport) {
                    const defaultImportText = defaultImport.getText();
                    if (defaultImportText === metadataVariableName) {
                        foundWithDefaultImport = true;
                        searchedImport = i;
                    }
                }
            }
        });

        function hasFoundValues(variableDeclaration) {
            let variableKind = variableDeclaration.getKind();

            if (variableKind && variableKind === SyntaxKind.VariableDeclaration) {
                let initializer = variableDeclaration.getInitializer();
                if (initializer) {
                    let initializerKind = initializer.getKind();
                    if (initializerKind && initializerKind === SyntaxKind.ObjectLiteralExpression) {
                        let compilerNode = initializer.compilerNode as ts.ObjectLiteralExpression;
                        return compilerNode.properties;
                    }
                }
            }
        }

        if (typeof searchedImport !== 'undefined') {
            let importPathReference = searchedImport.getModuleSpecifierSourceFile();
            let importPath;
            if (typeof importPathReference !== 'undefined') {
                importPath = importPathReference.compilerNode.fileName;

                const sourceFileImport =
                    typeof ast.getSourceFile(importPath) !== 'undefined'
                        ? ast.getSourceFile(importPath)
                        : ast.addSourceFileAtPathIfExists(importPath); // tslint:disable-line

                if (sourceFileImport) {
                    let variableName = foundWithAlias ? aliasOriginalName : metadataVariableName;
                    let variableDeclaration = sourceFileImport.getVariableDeclaration(variableName);

                    if (variableDeclaration) {
                        return hasFoundValues(variableDeclaration);
                    } else {
                        // Try with exports
                        const exportDeclarations = sourceFileImport.getExportedDeclarations();

                        if (exportDeclarations && exportDeclarations.size > 0) {
                            for (const [
                                exportDeclarationKey,
                                exportDeclarationValues
                            ] of exportDeclarations) {
                                exportDeclarationValues.forEach(exportDeclarationValue => {
                                    if (
                                        exportDeclarationValue instanceof VariableDeclaration &&
                                        exportDeclarationValue.getName() === variableName
                                    ) {
                                        return hasFoundValues(exportDeclarationValue);
                                    }
                                });
                            }
                        }
                    }
                }
            }
            if (
                !importPathReference &&
                decoratorType === 'template' &&
                searchedImport.getModuleSpecifierValue().indexOf('.html') !== -1
            ) {
                const originalSourceFilePath = sourceFile.path;
                const originalSourceFilePathFolder = originalSourceFilePath.substring(
                    0,
                    originalSourceFilePath.lastIndexOf('/')
                );
                const finalImportedPath =
                    originalSourceFilePathFolder + '/' + searchedImport.getModuleSpecifierValue();
                const finalImportedPathData = FileEngine.getSync(finalImportedPath);
                return finalImportedPathData;
            }
        } else {
            // Find in local variables of the file
            const variableDeclaration = file.getVariableDeclaration(metadataVariableName);
            if (variableDeclaration) {
                let variableKind = variableDeclaration.getKind();

                if (variableKind && variableKind === SyntaxKind.VariableDeclaration) {
                    let initializer = variableDeclaration.getInitializer();
                    if (initializer) {
                        let initializerKind = initializer.getKind();
                        if (
                            initializerKind &&
                            initializerKind === SyntaxKind.ObjectLiteralExpression
                        ) {
                            let compilerNode =
                                initializer.compilerNode as ts.ObjectLiteralExpression;
                            return compilerNode.properties;
                        } else if (
                            initializerKind &&
                            (initializerKind === SyntaxKind.StringLiteral ||
                                initializerKind === SyntaxKind.NoSubstitutionTemplateLiteral)
                        ) {
                            if (decoratorType === 'template') {
                                return initializer.getText();
                            } else {
                                return variableDeclaration.compilerNode;
                            }
                        } else if (initializerKind) {
                            return variableDeclaration.compilerNode;
                        }
                    }
                }
            }
        }

        return [];
    }

    public getFileNameOfImport(variableName: string, sourceFile: ts.SourceFile) {
        const file =
            typeof ast.getSourceFile(sourceFile.fileName) !== 'undefined'
                ? ast.getSourceFile(sourceFile.fileName)
                : ast.addSourceFileAtPath(sourceFile.fileName); // tslint:disable-line
        const imports = file.getImportDeclarations();
        let searchedImport,
            aliasOriginalName = '',
            finalPath = '',
            foundWithAlias = false;
        imports.forEach(i => {
            let namedImports = i.getNamedImports(),
                namedImportsLength = namedImports.length,
                j = 0;

            if (namedImportsLength > 0) {
                for (j; j < namedImportsLength; j++) {
                    let importName = namedImports[j].getNameNode().getText() as string,
                        importAlias;

                    if (namedImports[j].getAliasNode()) {
                        importAlias = namedImports[j].getAliasNode().getText();
                    }
                    if (importName === variableName) {
                        searchedImport = i;
                        break;
                    }
                    if (importAlias === variableName) {
                        foundWithAlias = true;
                        aliasOriginalName = importName;
                        searchedImport = i;
                        break;
                    }
                }
            }
        });
        if (typeof searchedImport !== 'undefined') {
            let importPath = path.resolve(
                path.dirname(sourceFile.fileName) +
                    '/' +
                    searchedImport.getModuleSpecifierValue() +
                    '.ts'
            );
            let cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
            finalPath = importPath.replace(cleaner, '');
        }
        return finalPath;
    }

    /**
     * Find the file path of imported variable
     * @param  {string} inputVariableName  like thestring
     * @return {[type]}                    thestring destination path
     */
    public findFilePathOfImportedVariable(inputVariableName, sourceFilePath: string) {
        let searchedImport,
            finalPath = '',
            aliasOriginalName = '',
            foundWithAlias = false;
        const file =
            typeof ast.getSourceFile(sourceFilePath) !== 'undefined'
                ? ast.getSourceFile(sourceFilePath)
                : ast.addSourceFileAtPath(sourceFilePath); // tslint:disable-line
        const imports = file.getImportDeclarations();

        /**
         * Loop through all imports, and find one matching inputVariableName
         */
        imports.forEach(i => {
            let namedImports = i.getNamedImports(),
                namedImportsLength = namedImports.length,
                j = 0;

            if (namedImportsLength > 0) {
                for (j; j < namedImportsLength; j++) {
                    let importName = namedImports[j].getNameNode().getText() as string,
                        importAlias;

                    if (namedImports[j].getAliasNode()) {
                        importAlias = namedImports[j].getAliasNode().getText();
                    }
                    if (importName === inputVariableName) {
                        searchedImport = i;
                        break;
                    }
                    if (importAlias === inputVariableName) {
                        foundWithAlias = true;
                        aliasOriginalName = importName;
                        searchedImport = i;
                        break;
                    }
                }
            }
        });
        if (typeof searchedImport !== 'undefined') {
            finalPath = path.resolve(
                path.dirname(sourceFilePath) +
                    '/' +
                    searchedImport.getModuleSpecifierValue() +
                    '.ts'
            );
        }
        return finalPath;
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

        const file =
            typeof ast.getSourceFile(sourceFile.fileName) !== 'undefined'
                ? ast.getSourceFile(sourceFile.fileName)
                : ast.addSourceFileAtPath(sourceFile.fileName); // tslint:disable-line
        const imports = file.getImportDeclarations();

        /**
         * Loop through all imports, and find one matching inputVariableName
         */
        imports.forEach(i => {
            let namedImports = i.getNamedImports(),
                namedImportsLength = namedImports.length,
                j = 0;

            if (namedImportsLength > 0) {
                for (j; j < namedImportsLength; j++) {
                    let importName = namedImports[j].getNameNode().getText() as string,
                        importAlias;

                    if (namedImports[j].getAliasNode()) {
                        importAlias = namedImports[j].getAliasNode().getText();
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

        let fileToSearchIn, variableDeclaration;
        if (typeof searchedImport !== 'undefined') {
            let importPath = path.resolve(
                path.dirname(sourceFile.fileName) +
                    '/' +
                    searchedImport.getModuleSpecifierValue() +
                    '.ts'
            );
            const sourceFileImport =
                typeof ast.getSourceFile(importPath) !== 'undefined'
                    ? ast.getSourceFile(importPath)
                    : ast.addSourceFileAtPath(importPath); // tslint:disable-line
            if (sourceFileImport) {
                fileToSearchIn = sourceFileImport;
                let variableName = foundWithAlias ? aliasOriginalName : metadataVariableName;
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
                let val = this.findInEnums(
                    fileToSearchIn,
                    metadataVariableName,
                    variablesAttributes[1]
                );
                if (val !== '') {
                    return val;
                }
                val = this.findInClasses(
                    fileToSearchIn,
                    metadataVariableName,
                    variablesAttributes[1]
                );
                if (val !== '') {
                    return val;
                }
            }
        }
    }
}

export default ImportsUtil.getInstance();
