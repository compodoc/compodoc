import * as ts from 'typescript';

export function getModuleWithProviders(node: ts.VariableStatement) {
    let result;
    if (node.declarationList) {
        if (node.declarationList.declarations && node.declarationList.declarations.length > 0) {
            let i = 0,
                declarations = node.declarationList.declarations,
                len = node.declarationList.declarations.length;

                for (i; i<len; i++) {
                    let declaration = node.declarationList.declarations[i];

                    if (declaration.type) {
                        let type: ts.TypeReferenceNode = declaration.type as ts.TypeReferenceNode;
                        if (type.typeName) {
                            let text = type.typeName.getText();
                            if (text === 'ModuleWithProviders') {
                                result = declaration.initializer;
                            }
                        }
                    }
                }
        }
    }
    return result;
}