#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const DEFAULT_NAME = "ai-box";
const TEMPLATE_PATH = path.join(__dirname, "lima-copilot.yaml");

function usage() {
  process.stdout.write(`Usage: node ai-box.js [name]

Starts the Lima box for the current directory.
Default name: ${DEFAULT_NAME}
`);
}

function fail(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio || ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      fail(`Required command not found: ${command}`);
    }
    fail(result.error.message);
  }

  if ((result.status ?? 0) !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    fail(output || `${command} exited with status ${result.status}`);
  }

  return result.stdout || "";
}

function vmExists(name) {
  return run("limactl", ["list", "-q"])
    .split(/\r?\n/)
    .map((line) => line.trim())
    .includes(name);
}

function vmRunning(name) {
  return run("limactl", ["list", name, "--format", "{{.Status}}"])
    .trim()
    .startsWith("Running");
}

function createVm(name) {
  run(
    "limactl",
    ["create", "--yes", `--name=${name}`, `--mount=.:w`, TEMPLATE_PATH],
    {
      stdio: "inherit",
    },
  );
}

function startVm(name) {
  run("limactl", ["start", name], { stdio: "inherit" });
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    usage();
    return;
  }
  if (args.length > 1) {
    usage();
    process.exit(1);
  }

  run("limactl", ["--version"]);

  const name = args[0] || DEFAULT_NAME;

  if (!vmExists(name)) {
    process.stdout.write(`[ai-box] Creating new VM: ${name}\n`);
    createVm(name);
  } else {
    process.stdout.write(`[ai-box] Using existing VM: ${name}\n`);
  }

  if (!vmRunning(name)) {
    process.stdout.write(`[ai-box] Starting VM: ${name}\n`);
    startVm(name);
  } else {
    process.stdout.write(`[ai-box] VM already running: ${name}\n`);
  }

  process.stdout.write(`[ai-box] Shell: limactl shell ${name}\n`);
}

main();
