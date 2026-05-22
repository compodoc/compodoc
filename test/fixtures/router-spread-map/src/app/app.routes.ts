import { Route, Routes } from '@angular/router';
import { ScenarioPartType } from './scenario-part-type.enum';
import {
    PartsListContainerComponent,
    ScenarioPartDetailsComponent,
    ScenarioManagementDashboardComponent,
    ScenarioManagementComponent
} from './app.component';

interface DetailPartRouteType {
    path: string;
    type: ScenarioPartType;
}

const detailPartChildRoutes: DetailPartRouteType[] = [
    { path: 'workflows', type: ScenarioPartType.Workflows },
    { path: 'actions', type: ScenarioPartType.Actions },
    { path: 'contents', type: ScenarioPartType.Contents },
    { path: 'docs', type: ScenarioPartType.Documents },
    { path: 'executors', type: ScenarioPartType.Executors },
    { path: 'indicators', type: ScenarioPartType.Indicators },
    { path: 'messages', type: ScenarioPartType.Messages },
    { path: 'problems', type: ScenarioPartType.ProblemAreas },
    { path: 'roles', type: ScenarioPartType.Roles },
    { path: 'solutions', type: ScenarioPartType.SolutionCategories },
    { path: 'stories', type: ScenarioPartType.Storylines },
    { path: 'vars', type: ScenarioPartType.Variables }
];

// This is the pattern that triggered the bug:
// const initialized with .map() (CallExpression) instead of an ArrayLiteralExpression.
// cleanFileSpreads must skip it gracefully with a warning instead of throwing.
const allPartRoutes: Route[] = detailPartChildRoutes.map(route => {
    return {
        path: route.path,
        data: { type: route.type },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: PartsListContainerComponent
            },
            {
                path: ':idItem',
                component: ScenarioPartDetailsComponent
            }
        ]
    };
});

export const routes: Routes = [
    {
        path: 'scenario/:id/manage',
        component: ScenarioManagementComponent,
        children: [
            {
                path: '',
                component: ScenarioManagementDashboardComponent,
                pathMatch: 'full',
                data: { type: ScenarioPartType.Dashboard }
            },
            ...allPartRoutes
        ]
    }
];
