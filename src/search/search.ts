export interface Search {
  search(terms: string): Promise<string[]>
}

export type Store = Record<string, string>

export interface RawIndex<T = unknown> {
  index: T
  store: Store
}
