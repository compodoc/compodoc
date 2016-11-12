import { NgModule } from '@angular/core';
import { BarDirective } from './bar.directive';
import { BarComponent } from './bar.component';
import { BarService } from './bar.service';

@NgModule({
  declarations: [
    BarDirective, BarComponent
  ],
  exports: [
    BarDirective, BarComponent
  ],
  providers: [
    BarService
  ]
})
export class BarModule { }
