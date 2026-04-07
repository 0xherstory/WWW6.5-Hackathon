import { getApiRuntime } from "./storage.mjs";

const { config, storage } = getApiRuntime();

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

async function withErrorBoundary(res, task) {
  try {
    await task();
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务异常";
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number(error.statusCode)
        : 500;

    writeJson(res, statusCode, {
      message,
      provider: storage.provider,
    });
  }
}

export function createNodeApiHandler() {
  return async function handleApiRequest(req, res) {
    if (!req.url) {
      writeJson(res, 404, { message: "未找到接口" });
      return;
    }

    if (req.method === "OPTIONS") {
      writeJson(res, 200, { ok: true });
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      writeJson(res, 200, {
        ok: true,
        port: config.mockApiPort,
        provider: storage.provider,
        supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/demo/reset") {
      await withErrorBoundary(res, async () => {
        const result = await storage.resetDemoData();
        writeJson(res, 200, result);
      });
      return;
    }

    const dashboardMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/dashboard$/);
    if (req.method === "GET" && dashboardMatch) {
      await withErrorBoundary(res, async () => {
        const wallet = dashboardMatch[1].toLowerCase();
        const dashboard = await storage.getDashboard(wallet);
        writeJson(res, 200, dashboard);
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/pacts") {
      await withErrorBoundary(res, async () => {
        const body = await readBody(req);
        if (!body.wallet || !body.habitName) {
          writeJson(res, 400, { message: "缺少必要字段" });
          return;
        }

        const pact = await storage.createPact({
          wallet: String(body.wallet),
          habitName: String(body.habitName),
          category: body.category ?? "unknown",
          frequencyLabel: body.frequencyLabel ?? "每天",
          frequencyCode: String(body.frequencyCode ?? "0"),
          durationDays: Number(body.durationDays ?? 7),
          stakeAmountWei: String(body.stakeAmountWei ?? "0"),
          startAt: body.startAt ?? new Date().toISOString(),
        });

        writeJson(res, 200, pact);
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/pacts/sync") {
      await withErrorBoundary(res, async () => {
        const body = await readBody(req);
        const wallet = String(body.wallet ?? "").toLowerCase();
        const pacts = Array.isArray(body.pacts) ? body.pacts : [];
        const dashboard = await storage.syncPacts(wallet, pacts);
        writeJson(res, 200, dashboard);
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/checkins") {
      await withErrorBoundary(res, async () => {
        const body = await readBody(req);
        const wallet = String(body.wallet ?? "").toLowerCase();
        const pactId = String(body.pactId ?? "");
        const result = await storage.recordCheckin(wallet, pactId, body.txHash, body.checkedAt);
        writeJson(res, 200, {
          pact: result.pact,
          encouragement: result.encouragement,
          summary: result.pact.summary,
        });
      });
      return;
    }

    const claimMatch = url.pathname.match(/^\/api\/pacts\/([^/]+)\/claim$/);
    if (req.method === "POST" && claimMatch) {
      await withErrorBoundary(res, async () => {
        const body = await readBody(req);
        const wallet = String(body.wallet ?? "").toLowerCase();
        const pactId = claimMatch[1];
        const pact = await storage.claimReward(wallet, pactId);
        writeJson(res, 200, pact);
      });
      return;
    }

    writeJson(res, 404, { message: "未找到接口" });
  };
}

export function getApiRuntimeMeta() {
  return {
    config,
    provider: storage.provider,
  };
}
