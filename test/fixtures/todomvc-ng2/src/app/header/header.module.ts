import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './header.component';

const COMPO = [HeaderComponent];

const COMPOS = [...COMPO];

/**
 * The header module
 */
@NgModule({
    imports: [FormsModule],
    declarations: [...COMPOS],
    exports: [HeaderComponent]
})
export class HeaderModule {}
