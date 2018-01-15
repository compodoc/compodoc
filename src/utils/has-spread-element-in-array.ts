import * as ts from 'typescript';

export function hasSpreadElementInArray(arr): boolean {
    let result = false;
    arr.map(el => {
        if (el.kind && el.kind === ts.SyntaxKind.SpreadElement) {
            result = true;
        }
    });
    return result;
}