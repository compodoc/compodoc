import { Component } from '@angular/core';

/**
 * The home component
 */
@Component({
    selector: 'home',
    template: `
        <div class="todoapp">
            <header class="header"></header>
            <list class="main"></list>
            <footer></footer>
        </div>
    `
})
export class HomeComponent {}
