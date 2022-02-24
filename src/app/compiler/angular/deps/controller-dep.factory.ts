import { IDep } from '../dependencies.interfaces';
import { ts } from 'ts-morph';

const crypto = require('crypto');

export class ControllerDepFactory {
    constructor() {}

    public create(
        file: any,
        srcFile: ts.SourceFile,
        name: string,
        properties: ReadonlyArray<ts.ObjectLiteralElementLike>,
        IO: any
    ): IControllerDep {
        const sourceCode = srcFile.getText();
        const hash = crypto.createHash('sha512').update(sourceCode).digest('hex');
        const infos: IControllerDep = {
            name,
            id: 'controller-' + name + '-' + hash,
            file: file,
            methodsClass: IO.methods,
            type: 'controller',
            description: IO.description,
            rawdescription: IO.rawdescription,
            sourceCode: srcFile.text,
            deprecated: IO.deprecated,
            deprecationMessage: IO.deprecationMessage
        };
        if (properties && properties.length === 1) {
            if (properties[0].text) {
                infos.prefix = properties[0].text;
            }
        }
        if (IO.extends) {
            infos.extends = IO.extends;
        }
        return infos;
    }
}

export interface IControllerDep extends IDep {
    file: any;
    sourceCode: string;
    description: string;
    rawdescription: string;
    prefix?: string;
    methodsClass: Array<any>;
    deprecated: boolean;
    deprecationMessage: string;
    extends?: any;
}
