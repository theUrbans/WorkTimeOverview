import Database from "../database.ts";
import TimeService from "./TimeService.ts";

class Api {
  private static instance: Api;
  private database: Database;

  public timeService: TimeService;

  private constructor() {
    this.database = new Database({
      hostname: "192.168.1.4",
      port: 5432,
      database: "docstool",
      user: "postgres",
      password: "postgres",
    });
    this.timeService = new TimeService(this.database);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Api();
    }
    return this.instance;
  }
}

export default Api.getInstance();