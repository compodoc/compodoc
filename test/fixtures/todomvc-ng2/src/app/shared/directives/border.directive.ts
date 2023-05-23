import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[appBorder]',
    standalone: true,
})
export class BorderDirective implements OnInit {
    @Input() color: string = 'red';

    constructor(private el: ElementRef) {}

    ngOnInit() {
        this.border('');
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.border(this.color);
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.border('');
    }

    private border(color: string) {
        this.el.nativeElement.style.border = `2px solid ${color || 'transparent'}`;
    }
}
