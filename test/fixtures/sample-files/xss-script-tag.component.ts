import { Component } from '@angular/core';

@Component({
    selector: 'app-xss-script-tag',
    template: `<div></script><script>window.__xss_executed=true</script></div>`
})
export class XssScriptTagComponent {}
