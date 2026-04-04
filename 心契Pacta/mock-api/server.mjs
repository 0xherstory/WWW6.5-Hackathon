import { createServer } from "node:http";
import { createNodeApiHandler, getApiRuntimeMeta } from "./app.mjs";

const { config, provider } = getApiRuntimeMeta();
const server = createServer(createNodeApiHandler());

server.listen(config.mockApiPort, () => {
  console.log(`Mock API running at http://localhost:${config.mockApiPort} (${provider})`);
});
