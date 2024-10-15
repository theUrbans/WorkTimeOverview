import Database from "./database.ts";
import TimeService from "./Service/TimeService.ts";

async function main() {
  const db = new Database({
    hostname: "192.168.1.4",
    port: 5432,
    database: "docstool",
    user: "postgres",
    password: "postgres",
  });

  const service = new TimeService(db);
  const daily = await service.getTodayWorktime(7);

  console.log(daily);
}

await main();
