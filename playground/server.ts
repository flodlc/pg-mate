import { pgMate } from "../dist/index";
import { config } from "./migrations/pg-mate";

(async () => {
  const pgMateClient = await pgMate.init(config);
  await pgMateClient.migrate();
  process.exit(0);
})();
