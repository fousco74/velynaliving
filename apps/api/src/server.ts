import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnect } from "./db.js";
import { UPLOAD_DIR } from "./lib/uploads.js";

const server = createApp().listen(env.PORT, () => {
  console.log(`API Velyna prête sur http://localhost:${env.PORT}`);
  // Le chemin résolu, pas la valeur brute : un UPLOAD_DIR relatif dépend du
  // répertoire de lancement, et c'est précisément ce qu'on veut pouvoir lire
  // dans les journaux du serveur le jour où des images manquent.
  console.log(`Images téléversées : ${UPLOAD_DIR}`);
});

const shutdown = async (signal: string) => {
  console.log(`\n${signal} reçu, arrêt en cours…`);
  server.close();
  await disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
