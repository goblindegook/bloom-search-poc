export interface Search {
  search(terms: string): Promise<string[]>
  size: number
  gzippedSize: number
}

export type Store = Record<string, string>

export interface RawIndex<T = unknown> {
  index: T
  store: Store
  size: number
  gzippedSize: number
}
