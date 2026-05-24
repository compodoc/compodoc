import { Routes } from "@angular/router";
import { sharedRoutes } from "@shared/pages/shared.routes";

export const routes: Routes = [
    { path: "home", component: "HomeComponent" as any },
    ...sharedRoutes,
];
