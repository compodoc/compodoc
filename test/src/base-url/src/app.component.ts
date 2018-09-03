import { Component } from '@angular/core';
import * as classes from './classes';
import { coreFunction } from '@project/core';

/**
 * The main component
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public getOrganizations(): Observable<any[]> {
        console.log('yo');
    }

    public getProperty<T, K extends keyof T>(obj: T, key: K) {
        return obj[key];
    }

    public method(): any {
        const a = new classes.SubClassA();
        coreFunction(a);
    }
}
