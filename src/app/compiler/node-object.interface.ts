export interface NodeObject {
    kind: Number;
    pos: Number;
    end: Number;
    text: string;
    initializer: NodeObject;
    name?: { text: string };
    expression?: NodeObject;
    elements?: NodeObject[];
    arguments?: NodeObject[];
    properties?: any[];
    parserContextFlags?: Number;
    equalsGreaterThanToken?: NodeObject[];
    parameters?: NodeObject[];
    Component?: string;
    body?: {
        pos: Number;
        end: Number;
        statements: NodeObject[];
    };
}
