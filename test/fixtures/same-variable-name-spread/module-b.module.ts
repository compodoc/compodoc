import { NgModule } from '@angular/core';
import { GammaComponent } from './gamma.component';

// IMPORTANT: same variable name as in module-a.module.ts — this is the regression scenario
const components = [GammaComponent];

@NgModule({
    declarations: [...components],
    exports: [...components]
})
export class ModuleBModule {}
