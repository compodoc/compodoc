import * as ts from "typescript";
const tsany = ts as any;

// https://github.com/Microsoft/TypeScript/blob/2.1/src/compiler/utilities.ts#L1507
export function getJSDocs(node: ts.Node) {
  if (tsany.getJSDocs) {
      return tsany.getJSDocs.apply(this, arguments);
  } else {
      return [];
  }
}
