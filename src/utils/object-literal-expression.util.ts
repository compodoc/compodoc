import { SyntaxKind } from 'ts-simple-ast';

export function StringifyObjectLiteralExpression(ole) {
    let returnedString = '{';

    if (ole.properties && ole.properties.length > 0) {
        ole.properties.forEach((property, index) => {
            if (property.name) {
                returnedString += property.name.text + ': ';
            }
            if (property.initializer) {
                if (property.initializer.kind === SyntaxKind.StringLiteral) {
                    returnedString += `'` + property.initializer.text + `'`;
                } else if (property.initializer.kind === SyntaxKind.TrueKeyword) {
                    returnedString += `true`;
                } else if (property.initializer.kind === SyntaxKind.FalseKeyword) {
                    returnedString += `false`;
                } else {
                    returnedString += property.initializer.text;
                }
            }
            if (index < ole.properties.length - 1) {
                returnedString += ', ';
            }
        });
    }

    returnedString += '}';

    return returnedString;
}
