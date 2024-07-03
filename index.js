#!/usr/bin/env node

const { buildSync, formatMessagesSync } = require("esbuild");
const { spawnSync } = require("child_process");
const temp = require("temp");
const fs = require("fs");

function build(scriptPath, outputPath) {
    const result = buildSync({
        bundle: true,
        entryPoints: [scriptPath],
        format: "cjs",
        outfile: outputPath,
        platform: "node",
    });
    if (result.warnings.length) {
        const formatted = formatMessagesSync(result.warnings);
        console.error("\n".join(formatted));
    }
    if (result.errors.length) {
        const formatted = formatMessagesSync(result.errors);
        console.error("\n".join(formatted));
        return false;
    }
    return true;
}

function execute(outputPat, args) {
    return spawnSync("node", [outputPath, ...args], { stdio: "inherit" }).status;
}


function main() {
    const args = process.argv.slice(2);
    const scriptPath = args.shift();
    const outputPath = temp.path({ suffix: ".js" });
    let exitStatus = null;

    try {
        if (!build(scriptPath, outputPath)) {
            return;
        }
        exitStatus = execute(outputPath, args);
    }
    finally {
        if (fs.existsSync(outputPath)) {
            fs.rmSync(outputPath);
        }
    }

    process.exit(exitStatus == null ? -1 : exitStatus);
}

main();
