import { Component, HostListener } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

/**
 * The about component
 * 
 * {@link PIT}
 * 
 * {@link Direction}
 * 
 * {@link ChartChange}
 * 
 * {@link foo}
 *
 * Display some text with links for details about TodoMVC & Compodoc.
 */
@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    providers: [EmitterService],
    entryComponents: [TodoComponent, ListComponent],
    preserveWhitespaces: false
})
export class AboutComponent {

     public subscriptions: Subscription[];

    /**
     * HostListener mouseup description
     */
     @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
     onMouseup(mouseX: number, mouseY: number): void {

     }

     chartOptions: Highcharts.Options = {
         colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
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

     static readonly staticReadonlyVariable: string;

     public static publicStaticVariable: string;

     protected static protectedStaticMethod(): string {
         return '';
     }

     private static privateStaticMethod(): string {
         return '';
     }

     public static publicStaticMethod(): string {
         return '';
     }

     static staticMethod(): string {
         return '';
     }

     public publicMethod(): string {
         return '';
     }

     public async foo(): Promise<any> {}
}
