import { expect } from "chai";
import { shell, read, exists } from "../helpers";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

describe("CLI issue #1394 - route spread path resolution", () => {
    const projectRoot = path.join(
        os.tmpdir(),
        `compodoc.issue-1394.felipe.jesus.${process.pid}`,
    );
    const distFolder = path.join(projectRoot, "documentation");

    before(() => {
        fs.removeSync(projectRoot);
        fs.ensureDirSync(path.join(projectRoot, "src/app"));
        fs.ensureDirSync(path.join(projectRoot, "src/felipe"));

        fs.writeFileSync(
            path.join(projectRoot, "tsconfig.json"),
            JSON.stringify(
                {
                    include: ["src/**/*.ts"],
                },
                null,
                2,
            ),
        );

        fs.writeFileSync(
            path.join(projectRoot, "src/main.ts"),
            "import './app/app-routing.module';\n",
        );
        fs.writeFileSync(path.join(projectRoot, "src/polyfills.ts"), "\n");

        fs.writeFileSync(
            path.join(projectRoot, "src/felipe/routes.ts"),
            `export const EXTRA_ROUTES = [
  { path: 'spread-route', component: 'SpreadComponent' }
];
`,
        );

        fs.writeFileSync(
            path.join(projectRoot, "src/app/app-routing.module.ts"),
            `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EXTRA_ROUTES } from 'felipe/routes';

const APP_ROUTES: Routes = [
  ...EXTRA_ROUTES
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
`,
        );
    });

    after(() => {
        fs.removeSync(projectRoot);
    });

    it("should resolve spread imports without truncating paths when cwd contains dots", () => {
        const ls = shell(
            "node",
            [
                path.resolve(process.cwd(), "bin/index-cli.js"),
                "-p",
                "./tsconfig.json",
                "-e",
                "json",
                "-d",
                distFolder,
            ],
            {
                cwd: projectRoot,
            },
        );

        const stdout = ls.stdout.toString();
        const stderr = ls.stderr.toString();

        expect(stderr).to.equal("");
        expect(stdout).to.contain("Documentation generated");
        expect(stdout).to.not.contain("FileNotFoundError");
        expect(stdout).to.not.contain("Unhandled Rejection");
        expect(stdout).to.not.contain("/Users/felipe.ts");

        expect(exists(path.join(distFolder, "documentation.json"))).to.equal(
            true,
        );
        const documentation = JSON.parse(
            read(path.join(distFolder, "documentation.json")),
        );
        expect(JSON.stringify(documentation)).to.contain("spread-route");
    });
});
