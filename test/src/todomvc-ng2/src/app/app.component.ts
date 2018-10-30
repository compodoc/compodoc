import { Component } from '@angular/core';

/**
 * The main component
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public getOrganizations(): Observable<Todo[]> {
        console.log('yo');
    }

    public getProperty<T, K extends keyof T>(obj: T, key: K) {
        return obj[key];
    }

    public openSomeDialog(model, grid, callback: ({ index }) => {}): void {}
}
