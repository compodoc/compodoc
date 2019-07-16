import { NgModule } from '@angular/core';
declare const StoreModule: any;
declare const HomeModule: any;
declare const CoreModule: any;
declare const RouterModule: any;

@NgModule({
    imports: [
        RouterModule.forRoot([], { useHash: false }),

        StoreModule.provideStore({
            player: 'playerReducer',
            search: 'searchReducer'
        }),

        CoreModule,
        HomeModule.yolo1(),
        HomeModule.bar.yolo2(),
        HomeModule.foo.bar.yolo3({ 'oh-no-panic': true })
    ]
})
export class DeepModule {}
