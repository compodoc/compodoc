import { expect } from "chai";
import { RouterParserUtil } from "../../../src/utils/router-parser.util";

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

        // ── Standalone property-access chains — preserved for enum fallback ──
        // Property-access chains as standalone values are intentionally left unquoted so
        // the enum-resolution fallback in constructRoutesTree() can resolve them.

        it("should leave a standalone property-access chain unquoted (enum fallback handles it)", () => {
            expect(
                routerParser.cleanRawRoute("[{path:AppRoutes.center}]"),
            ).to.equal("[{path:AppRoutes.center}]");
        });

        it("should leave a deep property-access chain unquoted", () => {
            expect(
                routerParser.cleanRawRoute("[{path:AppRoutes.shared.main}]"),
            ).to.equal("[{path:AppRoutes.shared.main}]");
        });

        it("should leave enum references in data objects unquoted", () => {
            const result = routerParser.cleanRawRoute(
                '[{path:"x",data:{mode:NemoViewerMode.PATIENT}}]',
            );
            expect(result).to.include("NemoViewerMode.PATIENT");
            expect(result).not.to.include(':"NemoViewerMode.PATIENT"');
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

        it('should convert loadComponent arrow syntax to "path#Component" string', () => {
            const result = routerParser.cleanRawRoute(
                "[{path:'profile',loadComponent:()=>import('./profile/profile.component').then(m=>m.ProfileComponent)}]",
            );
            expect(result).to.include(
                'loadComponent:"./profile/profile.component#ProfileComponent"',
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
    });
});
