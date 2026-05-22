import { Component } from '@angular/core';

@Component({ selector: 'app-root', template: '<router-outlet></router-outlet>' })
export class AppComponent {}

@Component({ selector: 'app-parts-list', template: '' })
export class PartsListContainerComponent {}

@Component({ selector: 'app-part-details', template: '' })
export class ScenarioPartDetailsComponent {}

@Component({ selector: 'app-dashboard', template: '' })
export class ScenarioManagementDashboardComponent {}

@Component({ selector: 'app-management', template: '' })
export class ScenarioManagementComponent {}
