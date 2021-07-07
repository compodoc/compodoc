import { Component, Input } from '@angular/core';

@Component({ template: '' })
export abstract class MotherComponent {
    abstract myProp: string;

    constructor() {}

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
