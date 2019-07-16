import { Nothing } from '../decorators/nothing.decorator';
import { LogClass } from '../decorators/log.decorator';

@Nothing()
export class DoNothing {
    aname: string;
    doNothing() {
        // nothing here
    }
}
