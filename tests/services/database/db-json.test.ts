import { describe, it, expect } from "vitest";
import path from "path";
import { JsonDatabase } from "../../../src/services/database/db-json";

describe("JsonDatabase - getFilePath", () => {
  it("should return the correct file path for a collection", () => {
    const dbPath = path.resolve("../../test-data");
    const db = new JsonDatabase(dbPath);

    const filePath = (db as any).getFilePath("users");

    expect(filePath).toBe(path.join(dbPath, "users.json"));
  });
});
