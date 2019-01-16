export interface JsdocTagNameInterface {
    text: string;
}

export interface JsdocTypeExpressionInterface {
    type: any;
}

export interface JsdocParameterNameInterface {
    text: string;
}

export interface JsdocTagInterface {
    comment: string;
    name: string;
    tagName: JsdocTagNameInterface;
    parameterName: JsdocParameterNameInterface;
    type: any;
    defaultValue: any;
    typeExpression: JsdocTypeExpressionInterface;
}
