export interface IDatabase {
  init(): Promise<void>;
  findAll(collection: string): Promise<Array<Object>>;
  findById(collection: string, id: string): Promise<Object>;
  insert(collection: string, doc: Object): Promise<Object>;
  update(
    collection: string,
    id: string,
    updates: Object,
  ): Promise<Object | null>;
  delete(collection: string, id: string): Promise<void>;
}
