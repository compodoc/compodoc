import { NgModule } from '@angular/core';
import { AlphaComponent } from './alpha.component';
import { BetaComponent } from './beta.component';

// IMPORTANT: same variable name as in module-b.module.ts — this is the regression scenario
const components = [AlphaComponent, BetaComponent];

@NgModule({
    declarations: [...components],
    exports: [...components]
})
export class ModuleAModule {}
