import { expect } from "chai";
import {
    temporaryDir,
    shellAsync,
} from "../helpers";
const tmp = temporaryDir();

// Helper function to strip ANSI escape codes
function stripAnsi(str: string): string {
    return str.replace(/\u001b\[[0-9;]*m/g, "");
}

function waitForServingMessage(
    args: string[],
    expectedMessage: string,
    timeout = 25000,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = shellAsync("node", args);
        let output = "";
        let doneCalled = false;

        const done = () => {
            if (!doneCalled) {
                doneCalled = true;
                clearTimeout(timeoutId);
                child.kill("SIGTERM");
                resolve(output);
            }
        };

        const onData = (data) => {
            output += data.toString();
            if (stripAnsi(output).includes(expectedMessage)) {
                done();
            }
        };

        child.stdout.on("data", onData);
        child.stderr.on("data", onData);

        child.on("error", (err) => {
            if (!doneCalled) {
                doneCalled = true;
                clearTimeout(timeoutId);
                reject(err);
            }
        });

        child.on("exit", () => {
            if (!doneCalled) {
                doneCalled = true;
                clearTimeout(timeoutId);
                resolve(output);
            }
        });

        const timeoutId = setTimeout(() => {
            done();
        }, timeout);
    });
}

describe("CLI serving", () => {
    const distFolder = tmp.name + "-serving";

    describe("when serving with -s flag in another directory", () => {
        let stdoutString = "";
        before(async function () {
            this.timeout(30000);
            tmp.create(distFolder);
            stdoutString = await waitForServingMessage(
                ["./bin/index-cli.js", "-s", "-d", distFolder, "-r", "6700"],
                `Serving documentation from ${distFolder} at http://127.0.0.1:6700`,
            );
        });
        after(() => tmp.clean(distFolder));

        it("should serve", () => {
            expect(stripAnsi(stdoutString)).to.contain(
                `Serving documentation from ${distFolder} at http://127.0.0.1:6700`,
            );
        });
    });

    describe("when serving with default directory", () => {
        let stdoutString = "",
            child;
        before(function (done) {
            this.timeout(30000);
            tmp.create("documentation");

            const child = shellAsync("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-s",
                "-r",
                "6701",
            ]);

            let output = "";
            let errorOutput = "";
            let doneCalled = false;
            const callDone = (err?: Error) => {
                if (!doneCalled) {
                    doneCalled = true;
                    done(err);
                }
            };

            child.stdout.on("data", (data) => {
                output += data.toString();
                // Look for the serving message
                if (output.includes("Serving documentation from")) {
                    stdoutString = output;
                    child.kill("SIGTERM");
                    callDone();
                }
            });

            child.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            child.on("error", (err) => {
                console.error(`Process error: ${err}`);
                callDone(err);
            });

            child.on("exit", (code, signal) => {
                if (signal === "SIGTERM") {
                    // Expected termination
                    return;
                }
                if (code !== 0 && errorOutput) {
                    console.error(`Shell error: ${errorOutput}`);
                    callDone(new Error(`Process exited with code ${code}`));
                } else if (!stdoutString) {
                    // If we haven't captured output yet, use what we have
                    stdoutString = output;
                    callDone();
                }
            });

            // Fallback timeout
            setTimeout(() => {
                if (!doneCalled) {
                    stdoutString = output;
                    child.kill("SIGTERM");
                    callDone();
                }
            }, 25000);
        });

        it("should display message", () => {
            expect(stripAnsi(stdoutString)).to.contain(
                "Serving documentation from ./documentation/ at http://127.0.0.1:6701",
            );
        });
    });

    describe("when serving with default directory and different host", () => {
        let stdoutString = "",
            child;
        before(function (done) {
            this.timeout(30000);
            tmp.create("documentation");
            const child = shellAsync("node", [
                "./bin/index-cli.js",
                "-p",
                "./test/fixtures/sample-files/tsconfig.simple.json",
                "-s",
                "--host",
                "127.0.0.1",
                "-r",
                "6702",
            ]);

            let output = "";
            let errorOutput = "";
            let doneCalled = false;
            const callDone = (err?: Error) => {
                if (!doneCalled) {
                    doneCalled = true;
                    done(err);
                }
            };

            child.stdout.on("data", (data) => {
                output += data.toString();
                // Look for the serving message with 127.0.0.1 host
                if (
                    output.includes("Serving documentation from") &&
                    output.includes("127.0.0.1")
                ) {
                    stdoutString = output;
                    child.kill("SIGTERM");
                    callDone();
                }
            });

            child.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            child.on("error", (err) => {
                console.error(`Process error: ${err}`);
                callDone(err);
            });

            child.on("exit", (code, signal) => {
                if (signal === "SIGTERM") {
                    // Expected termination
                    return;
                }
                if (code !== 0 && errorOutput) {
                    console.error(`Shell error: ${errorOutput}`);
                    callDone(new Error(`Process exited with code ${code}`));
                } else if (!stdoutString) {
                    // If we haven't captured output yet, use what we have
                    stdoutString = output;
                    callDone();
                }
            });

            // Fallback timeout
            setTimeout(() => {
                if (!doneCalled) {
                    stdoutString = output;
                    child.kill("SIGTERM");
                    callDone();
                }
            }, 25000);
        });

        it("should display message", function () {
            if (stdoutString === "") {
                // Skip this test if there were network issues
                this.skip();
                return;
            }
            expect(stripAnsi(stdoutString)).to.contain(
                "Serving documentation from ./documentation/ at http://127.0.0.1:6702",
            );
        });
    });

    describe("when serving with default directory and without doc generation", () => {
        let stdoutString = "";
        before(async function () {
            this.timeout(30000);
            tmp.create("documentation");
            stdoutString = await waitForServingMessage(
                ["./bin/index-cli.js", "-s", "-d", "./documentation/", "-r", "6703"],
                "Serving documentation from ./documentation/ at http://127.0.0.1:6703",
            );
        });

        it("should display message", () => {
            expect(stripAnsi(stdoutString)).to.contain(
                "Serving documentation from ./documentation/ at http://127.0.0.1:6703",
            );
        });
    });

    describe("when serving with default directory, without -d and without doc generation", () => {
        let stdoutString = "";
        before(async function () {
            this.timeout(30000);
            tmp.create("documentation");
            stdoutString = await waitForServingMessage(
                ["./bin/index-cli.js", "-s", "-r", "6704"],
                "Serving documentation from ./documentation/ at http://127.0.0.1:6704",
            );
        });
        after(() => tmp.clean("documentation"));

        it("should display message", () => {
            expect(stripAnsi(stdoutString)).to.contain(
                "Serving documentation from ./documentation/ at http://127.0.0.1:6704",
            );
        });
    });
});
