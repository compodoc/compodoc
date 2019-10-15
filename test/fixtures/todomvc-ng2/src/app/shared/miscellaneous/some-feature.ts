import { throttle } from 'lodash-decorators';

import { PollingSpeed } from './util.const.ts';

export class SomeFeature {
    @throttle(1000 as PollingSpeed, { leading: true })
    doSomething() {
        // do something throttled
    }
}
