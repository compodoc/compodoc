import { expect } from "chai";
import { temporaryDir, shell } from "../helpers";

const tmp = temporaryDir();

describe("CLI issue #1384 - single file coverage command", () => {
    const distFolder = tmp.name + "-issue-1384";

    before(function (done) {
        tmp.create(distFolder);
        done();
    });

    after(() => tmp.clean(distFolder));

    it("should accept a single source file positional argument without ENOTDIR", () => {
        const command = shell("node", [
            "./bin/index-cli.js",
            "./test/fixtures/sample-files/bar.component.ts",
            "-p",
            "./test/fixtures/sample-files/tsconfig.simple.json",
            "--silent",
            "--coverageTest",
            "0",
            "--coverageTestShowOnlyFailed",
            "false",
            "-d",
            distFolder,
        ]);

        expect(command.status).to.equal(0);
        expect(command.stderr.toString()).to.equal("");
        expect(command.stdout.toString()).to.not.contain("ENOTDIR");
    });
});
