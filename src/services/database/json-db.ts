/**
 *  JSON Database implementation
 *
 *  Provides persistent storage using JSON files.
 *  Each collection is stored as separeate JSON files.
 */

import fs from "fs/promises";
import path from "path";
import { Logger } from "../index";
import { Config } from "../../config";
import { IDatabase } from "./interfaces";

const JSON_INDENT_SPACES: number = 2;

export class JsonDatabase implements IDatabase {
  private dbPath: string;
  private initialize: boolean;
  private cache: Map<string, any>;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || Config.database.jsonPath;
    this.initialize = false;
    this.cache = new Map();
  }

  public async init(): Promise<void> {
    try {
      await fs.mkdir(this.dbPath, { recursive: true });
      this.initialize = true;
      Logger.info(`JSON database initialized at ${this.dbPath}`);
    } catch (error) {
      Logger.error("Failed to initialize JSON database", error);
      throw new Error("JSON database initialization failed");
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialize) {
      await this.init();
    }
  }

  private getFilePath(collection: string): string {
    return path.join(this.dbPath, `${collection}.json`);
  }

  private async readCollection(collection: string): Promise<Array<Object>> {
    await this.ensureInitialized();

    const filePath = this.getFilePath(collection);

    try {
      const data = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(data);

      return parsed;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        const emptyCollection: Array<any> = [];
        this.cache.set(collection, emptyCollection);
        return emptyCollection;
      }
      Logger.error(`Error reading collection ${collection}:`, error);
      throw new Error(`Failed to read collection ${collection}`);
    }
  }

  private async writeCollection(
    collection: string,
    data: Array<Object>,
  ): Promise<void> {
    await this.ensureInitialized();

    const filePath = this.getFilePath(collection);

    try {
      this.cache.set(collection, data);

      await fs.writeFile(
        filePath,
        JSON.stringify(data, null, JSON_INDENT_SPACES),
        "utf8",
      );
    } catch (error: any) {
      Logger.error(`Error writing collection ${collection}:`, error);
      throw new Error(`Failed to write collection ${collection}`);
    }
  }

  public async findAll(collection: string): Promise<Array<Object>> {
    return this.readCollection(collection);
  }

  public async findById(collection: string, id: string): Promise<Object> {
    const data = await this.readCollection(collection);
    return (
      data.find((item: Record<string, any>) => {
        return item.id === id;
      }) || {}
    );
  }

  public async insert(
    collection: string,
    doc: Record<string, any>,
  ): Promise<Object> {
    if (!doc.id) {
      //TODO: create function 'generateId'
      //this.generateId
    }

    const data = await this.readCollection(collection);
    data.push(doc);
    await this.writeCollection(collection, data);

    return doc;
  }

  public async update(
    collection: string,
    id: string,
    update: Object,
  ): Promise<Object | null> {
    const data = await this.readCollection(collection);
    const existingItem = data.find((item: Record<string, any>) => {
      return item.id === id;
    });

    if (!existingItem) {
      Logger.error(`There is not any ${collection} with ID ${id}.`);
      throw new Error(`Item with ID ${id} doesn't exist.`);
    }

    const updatedData = data.map((item: Record<string, any>) => {
      if (item.id === id) {
        return { ...item, ...update, id };
      }
      return item;
    });

    await this.writeCollection(collection, updatedData);

    return this.findById(collection, id);
  }

  public async delete(collection: string, id: string): Promise<void> {
    const data = await this.readCollection(collection);

    const filtered = data.filter((item: Record<string, any>) => {
      return item.id !== id;
    });

    await this.writeCollection(collection, filtered);
  }
}
