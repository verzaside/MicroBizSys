const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const release = path.join(root, "dist", "apps-script");
const claspConfig = path.join(release, ".clasp.json");
const deployConfig = path.join(release, ".ugc-deploy.json");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const claspCommand = process.platform === "win32" ? "clasp.cmd" : "clasp";

function usage() {
  console.log(`Usage:
  npm run deploy:google -- --script-id <id> [--deployment-id <id>]
  npm run deploy:google -- [--deployment-id <id>]

First run:
  1. Enable the Apps Script API and run: clasp login
  2. Copy the Script ID from Apps Script project settings.
  3. Pass it with --script-id. It is saved locally under dist/.

Options:
  --script-id <id>       Existing Apps Script project attached to the Sheet.
  --deployment-id <id>  Existing web-app deployment to update automatically.
  --description <text>  Deployment description (defaults to the package version).
  --no-build             Push the current dist/apps-script files as-is.
  --dry-run              Print the steps without calling clasp.
  --help                 Show this help.
`);
}

function parseArgs(argv) {
  const options = { build: true, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--no-build") options.build = false;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (["--script-id", "--deployment-id", "--description"].includes(arg)) {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error(`${arg} needs a value.`);
      options[arg.slice(2).replaceAll("-", "_")] = value;
      i += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

function readJson(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args, { capture = false, dryRun = false } = {}) {
  const rendered = [command, ...args].join(" ");
  console.log(`> ${rendered}`);
  if (dryRun) return { status: 0, stdout: "" };
  const result = spawnSync(command, args, {
    cwd: release,
    encoding: "utf8",
    stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit",
    // Windows exposes the global clasp executable as clasp.cmd; Node requires
    // shell execution for .cmd shims. The arguments originate from this CLI's
    // explicit options and the package version.
    shell: process.platform === "win32",
    windowsHide: false,
  });
  if (capture && result.stdout) process.stdout.write(result.stdout);
  if (capture && result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}.`);
  }
  return result;
}

function build() {
  const result = spawnSync(process.execPath, [path.join(root, "tools", "build.cjs")], {
    cwd: root,
    stdio: "inherit",
    windowsHide: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Build exited with status ${result.status}.`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const existingConfig = readJson(claspConfig);
  const existingDeployConfig = readJson(deployConfig);
  const scriptId = options.script_id || process.env.CLASP_SCRIPT_ID || existingConfig.scriptId;
  const deploymentId =
    options.deployment_id || process.env.CLASP_DEPLOYMENT_ID || existingDeployConfig.deploymentId;

  if (!scriptId || scriptId === "PASTE_YOUR_APPS_SCRIPT_ID_HERE") {
    usage();
    throw new Error(
      "No Apps Script ID is configured. Pass --script-id once, or set CLASP_SCRIPT_ID.",
    );
  }

  if (options.build) build();
  if (!fs.existsSync(release)) throw new Error("dist/apps-script is missing. Run npm run build first.");

  writeJson(claspConfig, { scriptId, rootDir: "./" });
  if (deploymentId) writeJson(deployConfig, { deploymentId });

  run(claspCommand, ["push", "--force"], { dryRun: options.dryRun });

  if (deploymentId) {
    const description = options.description || `UGC OS ${packageJson.version}`;
    run(
      claspCommand,
      ["redeploy", deploymentId, "--description", description],
      { dryRun: options.dryRun },
    );
    console.log("Apps Script files pushed and the configured web-app deployment updated.");
  } else {
    console.log("Apps Script files pushed. Add --deployment-id once to update the mobile web app automatically.");
  }
}

try {
  main();
} catch (error) {
  console.error(`Deployment stopped: ${error.message}`);
  process.exitCode = 1;
}
