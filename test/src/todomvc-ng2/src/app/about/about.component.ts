import { Component, HostListener } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

/**
 * The about component
 *
 * Display some text with links for details about TodoMVC & Compodoc.
 */
@Component({
    selector: 'about',
    templateUrl: './about.component.html'
})
export class AboutComponent {

     public subscriptions: Subscription[];

    /**
     * HostListener mouseup description
     */
     @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
     onMouseup(mouseX: number, mouseY: number): void {

     }

     private _fullName: string;

     /**
      * Getter of _fullName
      * @return {string} _fullName value
      */
     get fullName(): string {
         return this._fullName;
     }

     /**
      * Setter of _fullName
      * @param  {string} newName The new name
      */
     set fullName(newName: string) {
         this._fullName = newName;
     }
}
