import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './header.component';

/**
 * The header module
 */
@NgModule({
    imports: [FormsModule],
    declarations: [HeaderComponent],
    exports: [HeaderComponent]
})
export class HeaderModule {}
