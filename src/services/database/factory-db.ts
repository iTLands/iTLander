import { Config } from "../../config";
import { ROOT_DIR } from "../../constants";
import { JsonDatabase } from "./json-db";

export class DatabaseFactory {
  public static type(provider?: string) {
    if (!provider) {
      provider = Config.database.type;
    }

    switch (provider) {
      case "json":
        return this.jsonDbProvider();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private static jsonDbProvider(): JsonDatabase {
    return new JsonDatabase(Config.database.jsonPath || `${ROOT_DIR}/data`);
  }

  //TODO: implement intance of MySQL or any other provider :)
}
