import { expect } from "chai";
import * as path from "path";
import * as sinon from "sinon";
import { Project } from "ts-morph";
import { CodeGenerator } from "../../../src/app/compiler/angular/code-generator";
import Configuration from "../../../src/app/configuration";
import { RouterParserUtil } from "../../../src/utils/router-parser.util";
import { logger } from "../../../src/utils/logger";

describe("Utils - RouterParserUtil", () => {
    let routerParser: RouterParserUtil;

    beforeEach(() => {
        routerParser = RouterParserUtil.getInstance();
    });

    describe("cleanRawRoute()", () => {
        // ── Existing behaviour (must not regress) ────────────────────────────

        it("should leave a plain string route unchanged (no expressions)", () => {
            const input = '[{path:"home",component:HomeComponent}]';
            expect(routerParser.cleanRawRoute(input)).to.equal(input);
        });

        it("should remove whitespace", () => {
            expect(routerParser.cleanRawRoute('[ { path: "home" } ]')).to.equal(
                '[{path:"home"}]',
            );
        });

        it("should strip trailing commas", () => {
            expect(routerParser.cleanRawRoute('[{path:"home",}]')).to.equal(
                '[{path:"home"}]',
            );
        });

        // ── String concatenation (issues #1346, #1610) ───────────────────────

        it("should merge two adjacent double-quoted string literals joined by +", () => {
            expect(
                routerParser.cleanRawRoute('[{path:"user"+"/:id"}]'),
            ).to.equal('[{path:"user/:id"}]');
        });

        it("should merge a chain of double-quoted string literals joined by +", () => {
            expect(
                routerParser.cleanRawRoute('[{path:"user"+"/"+"create"}]'),
            ).to.equal('[{path:"user/create"}]');
        });

        it("should absorb an identifier chain preceding a string literal (issue #1610)", () => {
            expect(
                routerParser.cleanRawRoute('[{path:AppRoutes.center+"/:id"}]'),
            ).to.equal('[{path:"AppRoutes.center/:id"}]');
        });

        it("should absorb an identifier chain following a string literal", () => {
            expect(
                routerParser.cleanRawRoute(
                    '[{path:"prefix/"+AppRoutes.center}]',
                ),
            ).to.equal('[{path:"prefix/AppRoutes.center"}]');
        });

        it("should merge complex multi-part concatenation (issue #1610 real case)", () => {
            expect(
                routerParser.cleanRawRoute(
                    '[{path:AppRoutes.shared.main+"/"+AppRoutes.shared.patient}]',
                ),
            ).to.equal(
                '[{path:"AppRoutes.shared.main/AppRoutes.shared.patient"}]',
            );
        });

        it("should handle enum + string + enum concatenation (issue #1346)", () => {
            expect(
                routerParser.cleanRawRoute(
                    '[{path:RouteEnum.HOME+"/"+RouteEnum.DETAIL}]',
                ),
            ).to.equal('[{path:"RouteEnum.HOME/RouteEnum.DETAIL"}]');
        });

        // ── Template literals (issue #1533) ──────────────────────────────────

        it("should convert \${VAR} expressions to identifiers then merge (issue #1533)", () => {
            expect(
                routerParser.cleanRawRoute('[{path:${USER}+"/"+${CREATE}}]'),
            ).to.equal('[{path:"USER/CREATE"}]');
        });

        // ── Standalone property-access chains — normalized for safe parsing ──

        it("should quote a standalone property-access chain to keep JSON5 parseable", () => {
            expect(
                routerParser.cleanRawRoute("[{path:AppRoutes.center}]"),
            ).to.equal('[{path:"AppRoutes.center"}]');
        });

        it("should quote a deep property-access chain", () => {
            expect(
                routerParser.cleanRawRoute("[{path:AppRoutes.shared.main}]"),
            ).to.equal('[{path:"AppRoutes.shared.main"}]');
        });

        it("should quote enum references in data objects", () => {
            const result = routerParser.cleanRawRoute(
                '[{path:"x",data:{mode:NemoViewerMode.PATIENT}}]',
            );
            expect(result).to.include(':"NemoViewerMode.PATIENT"');
        });

        it("should unwrap constructor-wrapped data objects for JSON5 parseability (issue #661)", () => {
            const cleaned = routerParser.cleanRawRoute(
                '[{path:"details/:id/:detailsSection",loadChildren:"../lazy/xx-yy-details.module#DetailsModule",data:newLazyRoutingOptions({preload:true,delay:2500})}]',
            );

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(parsed[0].data).to.deep.equal({
                preload: true,
                delay: 2500,
            });
        });

        it("should normalize shorthand object properties in route data for JSON5 parseability (issue #1354)", () => {
            const cleaned = routerParser.cleanRawRoute(
                '[{path:"x",data:{preload,delay:2500}}]',
            );

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(parsed[0].data.preload).to.equal("preload");
            expect(parsed[0].data.delay).to.equal(2500);
        });

        it('should normalize CodeGenerator dotted output like "Enum"."VALUE" (issue #1417)', () => {
            expect(
                routerParser.cleanRawRoute(
                    '[{"data":{"mode":"NemoViewerMode"."PATIENT"}}]',
                ),
            ).to.equal('[{"data":{"mode":"NemoViewerMode.PATIENT"}}]');
        });

        it("should not quote JSON5 reserved identifiers (true/false/null)", () => {
            expect(
                routerParser.cleanRawRoute(
                    "[{exact:true,optional:false,empty:null}]",
                ),
            ).to.equal("[{exact:true,optional:false,empty:null}]");
        });

        // ── Lazy loading (must not be replaced by arrow-fn sanitization) ─────

        it('should convert modern loadChildren arrow syntax to "path#Module" string', () => {
            const result = routerParser.cleanRawRoute(
                "[{path:'admin',loadChildren:()=>import('./admin/admin.module').then(m=>m.AdminModule)}]",
            );
            expect(result).to.include(
                'loadChildren:"./admin/admin.module#AdminModule"',
            );
            expect(result).not.to.include("[Function]");
        });

        it('should convert loadChildren syntax using destructured then parameter to "path#Module" string (issue #1319)', () => {
            const result = routerParser.cleanRawRoute(
                "[{path:'admin',loadChildren:()=>import('./admin/admin.module').then(({AdminModule})=>AdminModule)}]",
            );
            expect(result).to.include(
                'loadChildren:"./admin/admin.module#AdminModule"',
            );
            expect(result).not.to.include("[Function]");
        });

        it('should convert loadComponent arrow syntax to "path#Component" string', () => {
            const result = routerParser.cleanRawRoute(
                "[{path:'profile',loadComponent:()=>import('./profile/profile.component').then(m=>m.ProfileComponent)}]",
            );
            expect(result).to.include(
                'loadComponent:"./profile/profile.component#ProfileComponent"',
            );
            expect(result).not.to.include("[Function]");
        });

        // ── CodeGenerator output format (issue #1546) ────────────────────────
        // CodeGenerator wraps identifiers in double quotes and produces:
        //   "loadComponent":()=>import("path")."then"("m"=>"m"."Module")

        it('should convert CodeGenerator loadComponent output to "path#Component" string (issue #1546)', () => {
            // Simulates CodeGenerator output after whitespace removal
            const result = routerParser.cleanRawRoute(
                '[{"loadComponent":()=>import("./pages/rank.component")."then"("page"=>"page"."RankPage"),"path":"rank"}]',
            );
            expect(result).to.include(
                'loadComponent:"./pages/rank.component#RankPage"',
            );
            expect(result).not.to.include("[Function]");
        });

        it('should convert CodeGenerator loadComponent with explicit parens to "path#Component" string (issue #1546)', () => {
            // Simulates CodeGenerator output with (m)=>m.Module style
            const result = routerParser.cleanRawRoute(
                '[{"loadComponent":()=>import("./pages/login.component")."then"(("page")=>"page"."LoginPage"),"path":"login"}]',
            );
            expect(result).to.include(
                'loadComponent:"./pages/login.component#LoginPage"',
            );
            expect(result).not.to.include("[Function]");
        });

        it('should convert CodeGenerator loadChildren output to "path#Module" string (issue #1546)', () => {
            const result = routerParser.cleanRawRoute(
                '[{"loadChildren":()=>import("./admin/admin.module")."then"("m"=>"m"."AdminModule"),"path":"admin"}]',
            );
            expect(result).to.include(
                'loadChildren:"./admin/admin.module#AdminModule"',
            );
            expect(result).not.to.include("[Function]");
        });

        // ── Arrow functions in data/canActivate (issues #1287, #1484, #1480) ─

        it('should replace a simple arrow function in a data property with "[Function]" (issue #1484)', () => {
            const result = routerParser.cleanRawRoute(
                '[{path:"x",data:{desc:(x)=>x.name}}]',
            );
            expect(result).to.include('"[Function]"');
            expect(result).not.to.include("=>");
        });

        it('should replace a destructuring arrow function with "[Function]" (issue #1484 real case)', () => {
            const result = routerParser.cleanRawRoute(
                '[{path:"x",data:{desc:({data}:{data:TheDTO})=>data.stockTypeCode}}]',
            );
            expect(result).to.include('"[Function]"');
            expect(result).not.to.include("=>");
        });

        it('should replace a block-body arrow function with "[Function]"', () => {
            const result = routerParser.cleanRawRoute(
                '[{path:"x",data:{fn:(x)=>{returnx.name}}}]',
            );
            expect(result).to.include('"[Function]"');
            expect(result).not.to.include("=>");
        });

        // ── Safety: existing strings must not be corrupted ───────────────────

        it("should not corrupt already-quoted strings containing dots", () => {
            expect(
                routerParser.cleanRawRoute(
                    '[{path:"./my-file.component.html"}]',
                ),
            ).to.equal('[{path:"./my-file.component.html"}]');
        });

        it("should not corrupt a path string containing a + sign", () => {
            expect(routerParser.cleanRawRoute('[{title:"a+b"}]')).to.equal(
                '[{title:"a+b"}]',
            );
        });

        it("should not corrupt a path string containing parentheses", () => {
            expect(routerParser.cleanRawRoute('[{title:"a(b)c"}]')).to.equal(
                '[{title:"a(b)c"}]',
            );
        });

        // ── JSON5 round-trip after cleaning ──────────────────────────────────

        it("should allow JSON5.parse to succeed after cleaning string concatenation", () => {
            const cleaned = routerParser.cleanRawRoute(
                '[{path:AppRoutes.center+"/:id"}]',
            );
            let result: any;
            expect(() => {
                result = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(result[0].path).to.equal("AppRoutes.center/:id");
        });

        it("should allow JSON5.parse to succeed after cleaning multi-part concatenation", () => {
            const cleaned = routerParser.cleanRawRoute(
                '[{path:AppRoutes.shared.main+"/"+AppRoutes.shared.patient}]',
            );
            let result: any;
            expect(() => {
                result = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(result[0].path).to.equal(
                "AppRoutes.shared.main/AppRoutes.shared.patient",
            );
        });

        it("should allow JSON5.parse to succeed after replacing arrow function in data", () => {
            const cleaned = routerParser.cleanRawRoute(
                '[{path:"x",data:{fn:(x)=>x.name}}]',
            );
            let result: any;
            expect(() => {
                result = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(result[0].data.fn).to.equal("[Function]");
        });

        it("should allow JSON5.parse to succeed with unresolved dotted references in values and arrays (issue #1417)", () => {
            const cleaned = routerParser.cleanRawRoute(
                '[{"data":{"mode":"NemoViewerMode"."PATIENT","allowed":["UserTypes"."UserType2"]}}]',
            );
            let result: any;
            expect(() => {
                result = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(result[0].data.mode).to.equal("NemoViewerMode.PATIENT");
            expect(result[0].data.allowed[0]).to.equal("UserTypes.UserType2");
        });
    });

    describe("cleanFileDynamics() — template literals in route path (issue #1493)", () => {
        it("should keep template static text (/:) and allow JSON5.parse after CodeGenerator output", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1493.ts",
                `
const ATTRIBUTES_ROUTING_REGISTRY = {
    ATTRIBUTES_ENGINEERING: "engineering",
    ATTRIBUTES__ID: "id"
};
const ComponentConstants = {
    FLE_ASSET_MAINTENANCE_PLAN: "AssetMaintenancePlanComponent"
};
type AssetMaintenancePlanOutput = { assetText: string };
import { Routes } from "@angular/router";
const routes: Routes = [
    {
        path: \`\${ATTRIBUTES_ROUTING_REGISTRY.ATTRIBUTES_ENGINEERING}/:\${ATTRIBUTES_ROUTING_REGISTRY.ATTRIBUTES__ID}\`,
        data: {
            name: ComponentConstants.FLE_ASSET_MAINTENANCE_PLAN,
            desc: ({ data }: { data: AssetMaintenancePlanOutput }) => data.assetText
        }
    }
];
`,
            );

            routerParser.cleanFileDynamics(sourceFile);
            routerParser.cleanCallExpressions(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].path).to.equal("engineering/:id");
            expect(parsed[0].data.name).to.equal(
                "AssetMaintenancePlanComponent",
            );
            expect(parsed[0].data.desc).to.equal("[Function]");
        });
    });

    describe("cleanFileDynamics() — enum values in route outlet (issue #1335)", () => {
        it("should resolve enum member values used as outlet and stay JSON5-parseable", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1335.ts",
                `
import { Routes } from "@angular/router";

export enum MyRoutes {
    RouteOne = "one",
    RouteTwo = "two",
    RouteThree = "three",
    RouteFour = "four"
}

const routes: Routes = [
    { path: "", component: "MyComponent", outlet: MyRoutes.RouteFour }
];
`,
            );

            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();
            expect(parsed[0].outlet).to.equal("four");
        });
    });

    describe("cleanCallExpressions() — function calls in route values (issue #1293)", () => {
        it("should allow JSON5.parse when path is defined by a function call", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1293.ts",
                `
import { Routes } from "@angular/router";
export function homePageRoutePath(): string {
    return "";
}
const routes: Routes = [
    {
        path: homePageRoutePath(),
        component: "HomePageComponent"
    }
];
`,
            );

            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].path).to.equal("homePageRoutePath()");
        });

        it("should allow JSON5.parse for Route[] declarations with function calls", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1293-route-array.ts",
                `
import { Route } from "@angular/router";
function homePageRoutePath(): string {
    return "";
}
const routes: Route[] = [
    {
        path: homePageRoutePath(),
        component: "HomePageComponent"
    }
];
`,
            );

            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].path).to.equal("homePageRoutePath()");
        });

        it("should allow JSON5.parse for ReadonlyArray<Route> declarations with function calls", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1293-readonly-route-array.ts",
                `
import { Route } from "@angular/router";
function buildPath(): string {
    return "";
}
const routes: ReadonlyArray<Route> = [
    {
        path: buildPath(),
        component: "HomePageComponent"
    }
];
`,
            );

            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].path).to.equal("buildPath()");
        });

        it("should allow JSON5.parse for Route type aliases with function calls", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1293-route-alias.ts",
                `
import { Route } from "@angular/router";
type AppRoutes = Route[];
function resolvePath(): string {
    return "";
}
const routes: AppRoutes = [
    {
        path: resolvePath(),
        component: "HomePageComponent"
    }
];
`,
            );

            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].path).to.equal("resolvePath()");
        });

        it("should allow JSON5.parse for inferred routes arrays without explicit route typing", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/routes-1293-inferred-array.ts",
                `
function dynamicPath(): string {
    return "";
}
const routes = [
    {
        path: dynamicPath(),
        component: "HomePageComponent"
    }
];
`,
            );

            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].path).to.equal("dynamicPath()");
        });

        it("should allow enum references in feature-module Route[] data objects (issue #1334)", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            project.createSourceFile(
                "/tmp/user-types.enum.ts",
                `
export enum UserTypes {
    UserType1 = "UserType1",
    UserType2 = "UserType2"
}
`,
            );
            const sourceFile = project.createSourceFile(
                "/tmp/feature-routing.module.ts",
                `
import { Route } from "@angular/router";
import { UserTypes } from "./user-types.enum";

const routes: Route[] = [
    {
        path: "userType2",
        component: "UserType2Component",
        canActivate: ["RoleGuard"],
        data: {
            allowedUserTypes: [UserTypes.UserType2]
        }
    }
];
`,
            );

            routerParser.cleanFileSpreads(sourceFile);
            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].data.allowedUserTypes).to.deep.equal([
                "UserType2",
            ]);
        });

        it("should allow resolve callbacks using inject() in feature Route[] declarations (issue #1433)", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile(
                "/tmp/people-routing.module.ts",
                `
import { Route } from "@angular/router";

const routes: Route[] = [
    {
        path: "",
        component: "PersonListComponent",
        canActivate: ["AuthGuard"],
        resolve: {
            personListLink: () => inject(PersonListResolver).resolvePersonListLink()
        }
    }
];
`,
            );

            routerParser.cleanFileSpreads(sourceFile);
            routerParser.cleanCallExpressions(sourceFile);
            routerParser.cleanFileDynamics(sourceFile);

            const initializer = sourceFile
                .getVariableDeclarationOrThrow("routes")
                .getInitializerOrThrow().compilerNode;
            const generated = new CodeGenerator().generate(initializer);
            const cleaned = routerParser.cleanRawRoute(generated);

            let parsed: any;
            expect(() => {
                parsed = require("json5").parse(cleaned);
            }).not.to.throw();

            expect(parsed[0].resolve.personListLink).to.equal("[Function]");
        });
    });

    // ── cleanFileSpreads() — path alias resolution (issue #1545) ─────────────

    describe("cleanFileSpreads() — path alias resolution (issue #1545)", () => {
        const fixtureRoot = path.join(
            __dirname,
            "../../../../../test/fixtures/path-alias-spread",
        );
        const baseUrlFixtureRoot = path.join(
            __dirname,
            "../../../../../test/fixtures/baseurl-spread",
        );
        const appAliasFixtureRoot = path.join(
            __dirname,
            "../../../../../test/fixtures/path-alias-app-spread",
        );
        const relativeFixtureRoot = path.join(
            __dirname,
            "../../../../../test/fixtures/relative-spread-import",
        );

        afterEach(() => {
            Configuration.mainData.tsconfig = "";
        });

        it("should not throw when the spread import file cannot be resolved at all (safety net)", () => {
            // No tsconfig paths configured → alias stays unresolvable → must not crash
            Configuration.mainData.tsconfig = "";
            const warnStub = sinon.stub(logger, "warn");
            try {
                const project = new Project();
                const sourceFile = project.createSourceFile(
                    "/tmp/test-unresolvable-routes.ts",
                    `import { Routes } from '@angular/router';
import { missingRoutes } from '@missing/does-not-exist';
export const routes: Routes = [...missingRoutes];`,
                    { overwrite: true },
                );
                expect(() =>
                    routerParser.cleanFileSpreads(sourceFile),
                ).not.to.throw();
            } finally {
                warnStub.restore();
            }
        });

        it("should not throw when spread uses a function call expression (issue #1317)", () => {
            const warnStub = sinon.stub(logger, "warn");
            try {
                const project = new Project({ useInMemoryFileSystem: true });
                const sourceFile = project.createSourceFile(
                    "/tmp/test-spread-call-routes.ts",
                    `import { Routes } from '@angular/router';
const communicationCommonRoutes = () => [{ path: 'communication' }];
export const routes: Routes = [{ path: 'root', children: [...communicationCommonRoutes(), { path: 'fallback' }] }];`,
                    { overwrite: true },
                );

                expect(() =>
                    routerParser.cleanFileSpreads(sourceFile),
                ).not.to.throw();
                expect(sourceFile.getText()).to.contain(
                    "...communicationCommonRoutes()",
                );
                expect(warnStub.called).to.equal(true);
            } finally {
                warnStub.restore();
            }
        });

        it("should not throw when spread uses a property-access call expression (issue #1293)", () => {
            const warnStub = sinon.stub(logger, "warn");
            try {
                const project = new Project({ useInMemoryFileSystem: true });
                const sourceFile = project.createSourceFile(
                    "/tmp/test-spread-map-routes.ts",
                    `import { Routes } from '@angular/router';
const langs = ['en', 'pl'];
export const routes: Routes = [{ path: 'root', children: [...langs.map(lang => ({ path: lang }))] }];`,
                    { overwrite: true },
                );

                expect(() =>
                    routerParser.cleanFileSpreads(sourceFile),
                ).not.to.throw();
                expect(sourceFile.getText()).to.contain("...langs.map");
                expect(warnStub.called).to.equal(true);
            } finally {
                warnStub.restore();
            }
        });

        it("should resolve a path alias from tsconfig.paths and inline the spread without crashing (issue #1545)", () => {
            Configuration.mainData.tsconfig = path.join(
                fixtureRoot,
                "tsconfig.json",
            );
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(
                path.join(fixtureRoot, "src/app/app.routes.ts"),
            );
            expect(() =>
                routerParser.cleanFileSpreads(sourceFile),
            ).not.to.throw();
        });

        it("should inline relative spread imports without mangling the path (issue #1307)", () => {
            const previousScannedFiles = routerParser.scannedFiles;
            try {
                routerParser.scannedFiles = [];
                const project = new Project();
                const sourceFile = project.addSourceFileAtPath(
                    path.join(
                        relativeFixtureRoot,
                        "src/app/app-routing.module.ts",
                    ),
                );
                expect(() =>
                    routerParser.cleanFileSpreads(sourceFile),
                ).not.to.throw();
                expect(sourceFile.getText()).not.to.contain("...appRoutes");
                expect(sourceFile.getText()).to.contain('path: "custom"');
            } finally {
                routerParser.scannedFiles = previousScannedFiles;
            }
        });

        it("should resolve spread imports via tsconfig baseUrl in nested routing files (issue #1308)", () => {
            const previousScannedFiles = routerParser.scannedFiles;
            try {
                routerParser.scannedFiles = [];
                Configuration.mainData.tsconfig = path.join(
                    baseUrlFixtureRoot,
                    "tsconfig.json",
                );

                const project = new Project();
                const sourceFile = project.addSourceFileAtPath(
                    path.join(
                        baseUrlFixtureRoot,
                        "src/app/sections/main/main-routing.module.ts",
                    ),
                );
                expect(() =>
                    routerParser.cleanFileSpreads(sourceFile),
                ).not.to.throw();
                expect(sourceFile.getText()).not.to.contain(
                    "...customCategoryRoutes",
                );
                expect(sourceFile.getText()).to.contain('path: "category"');
            } finally {
                routerParser.scannedFiles = previousScannedFiles;
            }
        });

        it("should resolve @app/* path aliases from tsconfig.paths in nested routes (issue #654)", () => {
            const previousScannedFiles = routerParser.scannedFiles;
            try {
                routerParser.scannedFiles = [];
                Configuration.mainData.tsconfig = path.join(
                    appAliasFixtureRoot,
                    "tsconfig.json",
                );

                const project = new Project();
                const sourceFile = project.addSourceFileAtPath(
                    path.join(
                        appAliasFixtureRoot,
                        "src/app/stage/stage-routing.module.ts",
                    ),
                );
                expect(() =>
                    routerParser.cleanFileSpreads(sourceFile),
                ).not.to.throw();
                expect(sourceFile.getText()).not.to.contain("...appsRoutes");
                expect(sourceFile.getText()).to.contain('path: "apps"');
            } finally {
                routerParser.scannedFiles = previousScannedFiles;
            }
        });
    });
});
