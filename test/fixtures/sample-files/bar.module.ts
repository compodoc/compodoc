import { NgModule } from '@angular/core';
import { BarDirective } from './bar.directive';
import { BarComponent } from './bar.component';
import { BarService } from './bar.service';

/**
 * BarModule description
 *
 * see {@link http://www.google.fr}
 * see {@link http://www.google.fr|Second link}
 * see {@link http://www.google.uk Third link}
 * see [Last link]{@link http://www.google.jp}
 *
 * Watch [The BarComponent]{@link BarComponent}
 */
@NgModule({
    declarations: [BarDirective, BarComponent],
    exports: [BarDirective, BarComponent],
    providers: [BarService]
})
export class BarModule {}
