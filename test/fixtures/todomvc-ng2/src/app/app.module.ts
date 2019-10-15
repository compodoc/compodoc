import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HomeModule } from './home/';

import { AppComponent } from './app.component';

import { TodoStore } from './shared/services/todo.store';

/* Routing Module */
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { NoopInterceptor } from './shared/interceptors/noopinterceptor.interceptor';
/**
 * The bootstrapper module
 */
@NgModule({
    declarations: [AppComponent],
    imports: [HomeModule, AppRoutingModule],
    providers: [
        TodoStore,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NoopInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useFactory: (languageService: GlobalLanguageService) =>
                new HttpConfigurationInterceptor(languageService),
            deps: [GlobalLanguageService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    /**
     * Use this method in your root module
     */
    static forRoot(config: any = {}): ModuleWithProviders {}

    /**
     * Use this method in your other (non root) modules to import the directive/pipe
     */
    static forChild(config: any = {}): ModuleWithProviders {}
}
