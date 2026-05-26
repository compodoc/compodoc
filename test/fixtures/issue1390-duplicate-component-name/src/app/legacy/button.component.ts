import { Component, Input } from "@angular/core";

@Component({
    selector: "legacy-button",
    template: "<button>{{legacyLabel}}</button>",
})
export class ButtonComponent {
    @Input() legacyLabel!: string;
}
