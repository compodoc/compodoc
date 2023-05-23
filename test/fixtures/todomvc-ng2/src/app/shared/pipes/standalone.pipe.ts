import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'standalone',
    standalone: true,
})
export class StandAlonePipe implements PipeTransform {
    transform(value, args) {
        return 'StandAlone Pipe ;)';
    }
}
