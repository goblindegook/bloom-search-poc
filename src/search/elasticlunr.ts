import { decode } from '@msgpack/msgpack'
import { elasticlunr } from '../compatibility/elasticlunr.js'
import { SerialisedIndexData } from 'elasticlunr'

type Store = Record<string, string>

let store: Store
let index: elasticlunr.Index<{}>

export async function getElasticlunr(): Promise<Search> {
  if (store == null || index == null) {
    const response = await fetch('/bloom-search-poc/elasticlunr.msgpack')
    const buffer = await response.arrayBuffer()
    const raw = decode(buffer) as {
      store: Store
      index: SerialisedIndexData<{}>
    }
    store = raw.store
    index = elasticlunr.Index.load(raw.index)
  }

  return {
    search: (terms) =>
      index.search(terms).map((result: { ref: string }) => store[result.ref]),
  }
}
