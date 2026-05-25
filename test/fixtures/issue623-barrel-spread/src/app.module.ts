import * as fromComponents from "./components";

function NgModule(_: any) {
  return function (_target: any) {};
}

@NgModule({
  declarations: [...fromComponents.components],
  exports: [...fromComponents.components]
})
export class AppModule {}
