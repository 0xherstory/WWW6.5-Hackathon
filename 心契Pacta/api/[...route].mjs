import { createNodeApiHandler } from "../mock-api/app.mjs";

const handler = createNodeApiHandler();

export default async function vercelApiHandler(req, res) {
  await handler(req, res);
}
