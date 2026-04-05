import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function parseEnvValue(rawValue) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = parseEnvValue(trimmed.slice(separatorIndex + 1));

    process.env[key] = value;
  });
}

loadEnvFile(".env");
loadEnvFile(".env.local");

export function getServerConfig() {
  const provider = process.env.PACTA_DATA_PROVIDER === "supabase" ? "supabase" : "file";
  const mockApiPort = Number(process.env.MOCK_API_PORT ?? 8787);

  return {
    provider,
    mockApiPort,
    viteApiBaseUrl: process.env.VITE_API_BASE_URL ?? "/api",
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    supabaseProjectRef: process.env.SUPABASE_PROJECT_REF ?? "",
  };
}
