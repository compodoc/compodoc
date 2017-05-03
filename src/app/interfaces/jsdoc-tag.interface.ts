export interface jsdocTagNameInterface {
    text: string;
}

export interface jsdocTypeExpressionInterface {
    type: any;
}

export interface jsdocParameterNameInterface {
    text: string;
}

export interface jsdocTagInterface {
    comment: string;
    name: string;
    tagName: jsdocTagNameInterface;
    parameterName: jsdocParameterNameInterface;
    type: any;
    typeExpression: jsdocTypeExpressionInterface;
}
