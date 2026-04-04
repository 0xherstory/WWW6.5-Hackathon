import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function pipeOutput(label, child) {
  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });
}

const api = spawn(process.execPath, [path.join(__dirname, "server.mjs")], {
  cwd: root,
  env: { ...process.env, MOCK_API_PORT: process.env.MOCK_API_PORT ?? "8787" },
  stdio: ["inherit", "pipe", "pipe"],
});

const web = spawn(npmCommand, ["run", "dev", "--", "--host", "0.0.0.0", "--port", "8082"], {
  cwd: root,
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

pipeOutput("mock-api", api);
pipeOutput("web", web);

function stopAll(exitCode = 0) {
  if (!api.killed) {
    api.kill("SIGTERM");
  }
  if (!web.killed) {
    web.kill("SIGTERM");
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

api.on("exit", (code) => {
  if (code && code !== 0) {
    console.error(`[mock-api] exited with code ${code}`);
    stopAll(code);
  }
});

web.on("exit", (code) => {
  if (code && code !== 0) {
    console.error(`[web] exited with code ${code}`);
    stopAll(code);
  }
});
