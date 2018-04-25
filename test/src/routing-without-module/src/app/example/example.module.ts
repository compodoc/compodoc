import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './example.routes';
import { routes as R } from './example.routesa';

import { ExampleComponent } from './example.component';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ExampleComponent]
})
export class ExampleModule {}
