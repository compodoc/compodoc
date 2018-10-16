const util = require('util');

import { SyntaxKind } from "ts-simple-ast";

export function StringifyObjectLiteralExpression(ole) {
    let returnedString = '{';

    // console.log(util.inspect(ole, { showHidden: true, depth: 10 }));

    if (ole.properties && ole.properties.length > 0) {
        ole.properties.forEach(property => {
            // console.log(util.inspect(property, { showHidden: true, depth: 20 }));
            if (property.name) {
                returnedString += property.name.text + ':';
            }
            if (property.symbol) {
                if (property.symbol.declarations && property.symbol.declarations.length > 0) {
                    property.symbol.declarations.forEach(declaration => {
                        if (declaration.kind === SyntaxKind.PropertyAssignment) {
                            returnedString += declaration.name.text + ':';
                        }
                    });
                }
            }
        });
    }

    returnedString += '}';

    return returnedString;
}