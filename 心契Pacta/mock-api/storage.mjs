import { getServerConfig } from "./env.mjs";
import { createFileStorage } from "./storage-file.mjs";
import { createSupabaseStorage } from "./storage-supabase.mjs";

const config = getServerConfig();

function createStorage() {
  if (config.provider === "supabase") {
    return createSupabaseStorage(config);
  }

  return createFileStorage();
}

const storage = createStorage();

export function getApiRuntime() {
  return {
    config,
    storage,
  };
}
