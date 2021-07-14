import { SyntaxKind } from 'ts-morph';

export function hasSpreadElementInArray(arr): boolean {
    let result = false;
    arr.map(el => {
        if (el.kind && el.kind === SyntaxKind.SpreadElement) {
            result = true;
        }
    });
    return result;
}
