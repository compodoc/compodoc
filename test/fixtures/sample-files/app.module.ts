import { NgModule, BrowserModule } from '@angular/core';
import { FooDirective } from './foo.directive';
import { FooComponent } from './foo.component';
import { BarDirective } from './bar.directive';
import { BarComponent } from './bar.component';
import { FooService } from './foo.service';
import { BarModule } from './bar.module';
import { FooModule } from './foo.module';

/**
 * AppModule description
 *
 * See {@link BarComponent}
 */
@NgModule({
    declarations: [FooDirective, FooComponent, BarComponent],
    providers: [FooService],
    imports: [BarModule, FooModule],
    bootstrap: [FooComponent]
})
export class AppModule {}
