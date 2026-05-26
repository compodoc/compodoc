import { expect } from "chai";
import { temporaryDir, shell, exists, read } from "../helpers";

const tmp = temporaryDir();

describe("CLI issue #739 - nested interface properties", () => {
    const distFolder = tmp.name + "-issue-739";
    let interfaceFile: string;

    before((done) => {
        tmp.create(distFolder);
        const command = shell("node", [
            "./bin/index-cli.js",
            "-p",
            "./test/fixtures/issue739-nested-interface-properties/tsconfig.json",
            "-d",
            distFolder,
            "--silent",
        ]);

        if (command.stderr.toString() !== "") {
            console.error(`shell error: ${command.stderr.toString()}`);
            done("error");
            return;
        }

        interfaceFile = `${distFolder}/interfaces/AppConfig.html`;
        done();
    });

    after(() => tmp.clean(distFolder));

    it("should generate interface page", () => {
        expect(exists(interfaceFile)).to.be.true;
    });

    it("should render nested object members for interface properties", () => {
        const html = read(interfaceFile);
        expect(html).to.contain("io-nested-properties");
        expect(html).to.contain("questionAnsweredMs");
        expect(html).to.contain("restartAfterCompletedMs");
        expect(html).to.contain("restartTimoutMs");
        expect(html).to.contain(
            "Delay between clicking on an option and going to next question.",
        );
    });
});
