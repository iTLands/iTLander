import { Config } from "../../config";
import { IDatabase } from "./interfaces";
import { JsonDatabase } from "./json-db";

export class DatabaseFactory {
  private static registry: Record<string, () => IDatabase> = {
    json: () => new JsonDatabase(),
    //TODO: implement instance of MySQL or any other provider :)
  };

  public static create(type?: string): IDatabase {
    if (!type) {
      type = Config.database.type;
    }

    const create = this.registry[type];
    if (!create) throw new Error(`Unsupported provider: ${type}`);
    return create();
  }
}
