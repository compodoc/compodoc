import { IDep } from '../dependencies.interfaces';
import { ts } from 'ts-morph';

const crypto = require('crypto');

export class EntityDepFactory {
    constructor() {}

    public create(
        file: any,
        srcFile: ts.SourceFile,
        name: string,
        properties: ReadonlyArray<ts.ObjectLiteralElementLike>,
        IO: any
    ): IEntityDep {
        const sourceCode = srcFile.getText();
        const hash = crypto.createHash('sha512').update(sourceCode).digest('hex');
        const infos: IEntityDep = {
            name,
            id: 'controller-' + name + '-' + hash,
            file: file,
            type: 'entity',
            description: IO.description,
            rawdescription: IO.rawdescription,
            sourceCode: srcFile.text,
            deprecated: IO.deprecated,
            deprecationMessage: IO.deprecationMessage,
            properties: IO.properties
        };
        return infos;
    }
}

export interface IEntityDep extends IDep {
    file: any;
    sourceCode: string;
    description: string;
    rawdescription: string;
    deprecated: boolean;
    deprecationMessage: string;
    properties: Array<any>;
}
