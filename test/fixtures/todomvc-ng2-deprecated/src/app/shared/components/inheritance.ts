import { Component, Input } from '@angular/core';

/**
 * Mother component
 * @deprecated This component is deprecated
 */
@Component({ template: '' })
export abstract class MotherComponent {
    /**
     * @deprecated This property is deprecated
     */
    abstract myProp: string;

    constructor() {}

    /**
     * @deprecated This method is deprecated
     */
    abstract myMethod(): string;
}

@Component({ template: '' })
export class SonComponent extends MotherComponent {
    myProp: string;

    constructor() {
        super();
    }

    myMethod(): string {
        return 'Implementation A';
    }
}

@Component({ template: '' })
export class GrandsonComponent extends SonComponent {
    constructor() {
        super();
    }

    myMethod(): string {
        return 'Implementation B';
    }
}
