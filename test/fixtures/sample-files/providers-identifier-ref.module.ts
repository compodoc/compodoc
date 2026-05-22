import { NgModule, Injectable } from '@angular/core';

/** Providers identifier ref service */
@Injectable()
export class ProvidersIdentifierRefService {}

const MODULE_PROVIDERS = [ProvidersIdentifierRefService];

/**
 * Module using providers: VARIABLE_REF syntax
 */
@NgModule({
    providers: MODULE_PROVIDERS
})
export class ProvidersIdentifierRefModule {}
