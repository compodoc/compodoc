import { Component } from '@angular/core';

interface Foo<T> {
    data: T;
}

@Component({
    selector: 'app-generic',
})
export class GenericComponent {
    title = 'generic-component';

    getData(foo: Foo<object>) {}
}
