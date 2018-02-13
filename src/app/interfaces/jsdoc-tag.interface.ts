export interface jsdocTagNameInterface {
    text: string;
}

export interface jsdocTypeExpressionInterface {
    type: any;
}

export interface jsdocParameterNameInterface {
    text: string;
}

export interface JsdocTagInterface {
    comment: string;
    name: string;
    tagName: jsdocTagNameInterface;
    parameterName: jsdocParameterNameInterface;
    type: any;
    defaultValue: any;
    typeExpression: jsdocTypeExpressionInterface;
}
