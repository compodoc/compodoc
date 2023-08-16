import { PipeTransform, Pipe, OnDestroy } from '@angular/core';

@Pipe({
    name: 'bar',
    standalone: true
})
export class BarPipe implements PipeTransform, OnDestroy {
    transform(value, args) {
        return 'StandAlone Pipe ;)';
    }

    ngOnDestroy(): void {}
}
