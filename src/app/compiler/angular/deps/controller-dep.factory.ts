import { IDep } from '../dependencies.interfaces';
import { ts } from 'ts-simple-ast';
import { ConfigurationInterface } from '../../../interfaces/configuration.interface';

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
        let sourceCode = srcFile.getText();
        let hash = crypto
            .createHash('md5')
            .update(sourceCode)
            .digest('hex');
        let infos: IControllerDep = {
            name,
            id: 'controller-' + name + '-' + hash,
            file: file,
            methods: IO.methods,
            type: 'controller',
            sourceCode: srcFile.text
        };
        if (properties && properties.length === 1) {
            if (properties[0].text) {
                infos.prefix = properties[0].text;
            }
        }
        return infos;
    }
}

export interface IControllerDep extends IDep {
    file: any;
    sourceCode: string;
    prefix?: string;
    methods: Array<any>;
}
