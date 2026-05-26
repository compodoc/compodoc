import { NgModule } from "@angular/core";
import { ButtonComponent as CurrentButtonComponent } from "./current/button.component";
import { ButtonComponent as LegacyButtonComponent } from "./legacy/button.component";

@NgModule({
    declarations: [CurrentButtonComponent, LegacyButtonComponent],
})
export class AppModule {}
