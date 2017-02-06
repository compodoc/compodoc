let ngdT = require('@compodoc/ngd-transformer');
let ngdC = require('@compodoc/ngd-compiler');
let ngdCr = require('@compodoc/ngd-core');

let files = [ '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/about/about-routing.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/about/about.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/about/about.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/about/compodoc/compodoc.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/about/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/about/todomvc/todomvc.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/app-routing.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/app.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/app.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/footer/footer.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/footer/footer.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/footer/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/header/header.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/header/header.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/header/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/home/home-routing.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/home/home.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/home/home.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/home/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/list/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/list/list.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/list/list.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/list/todo/index.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/list/todo/todo.component.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/list/todo/todo.module.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/shared/directives/do-nothing.directive.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/shared/interfaces/interfaces.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/shared/models/todo.model.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/shared/pipes/first-upper.pipe.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/shared/services/emitter.service.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/app/shared/services/todo.store.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/environments/environment.prod.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/environments/environment.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/main.ts',
  '/Volumes/Data/wamp/Projets/open-source/compodoc/compodoc-demo-todomvc-angular2/src/polyfills.ts' ];

ngdCr.logger.silent = false;

let compiler = new ngdC.Compiler(
      files, {
        tsconfigDirectory: process.cwd()
      }
    );

let deps = compiler.getDependencies();

let engine = new ngdT.DotEngine({
      output: 'test',
      displayLegend: true,
      outputFormats: 'html,svg'
    });
    engine
      .generateGraph(deps)
      .then(file => {
          console.log('end');
      });
