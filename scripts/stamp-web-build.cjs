const { execFileSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { randomUUID } = require("node:crypto");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");
let commit = process.env.VERCEL_GIT_COMMIT_SHA || null;
if (!commit) {
  try {
    commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    // Source archives may not include Git metadata.
  }
}
const build = { id: randomUUID(), commit, builtAt: new Date().toISOString() };
const output = resolve(root, process.argv[2] || "dist");
const workerPath = resolve(output, "sw.js");
const worker = readFileSync(workerPath, "utf8");
if (!worker.includes("ember-web-v3")) throw new Error("Missing service worker cache marker");
writeFileSync(workerPath, worker.replace("ember-web-v3", `ember-web-${build.id}`));
writeFileSync(resolve(output, "version.json"), JSON.stringify(build, null, 2) + "\n");
console.log(`Web build ${build.id}, commit ${commit || "unknown"}`);
