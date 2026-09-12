import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnect } from "./db.js";

const server = createApp().listen(env.PORT, () => {
  console.log(`API Velyna prête sur http://localhost:${env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`\n${signal} reçu, arrêt en cours…`);
  server.close();
  await disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
