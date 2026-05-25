import { environment } from './environments/environment';

function Component(_: any) {
  return function (_target: any) {};
}

@Component({
  selector: 'app-root',
  templateUrl: environment.appTemplateUrl
})
export class AppComponent {}
