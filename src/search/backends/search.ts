import { decode } from '@msgpack/msgpack'

export interface SearchBackend {
  name: string
  title: string
  url: string
  size: number
  gzippedSize: number
  search(terms: string): string[]
}

export type Store = Record<string, string>

type RawIndex<T = unknown> = {
  index: T
  store: Store
  size: number
  gzippedSize: number
}

export async function fetchIndex<T>(name: string): Promise<RawIndex<T>> {
  const response = await fetch(`/bloom-search-poc/${name}.msgpack`)
  const buffer = await response.arrayBuffer()
  return decode(buffer) as RawIndex<T>
}
