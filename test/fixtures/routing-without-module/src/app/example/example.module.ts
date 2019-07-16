import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleRoutingModule } from './example-routing.module';

import { ExampleComponent } from './example.component';

@NgModule({
    imports: [CommonModule, ExampleRoutingModule],
    declarations: [ExampleComponent]
})
export class ExampleModule {}
