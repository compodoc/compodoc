import { Component, Input } from "@angular/core";

@Component({
    selector: "current-button",
    template: "<button>{{label}}</button>",
})
export class ButtonComponent {
    @Input() label!: string;
}
