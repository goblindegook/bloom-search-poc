import { decode } from '@msgpack/msgpack'
import elasticlunr from 'elasticlunr'
import { RawIndex, Search, Store } from './search'

let store: Store
let index: elasticlunr.Index<{}>

export async function getElasticlunr(): Promise<Search> {
  if (store == null || index == null) {
    const response = await fetch('/bloom-search-poc/elasticlunr.msgpack')
    const buffer = await response.arrayBuffer()
    const raw = decode(buffer) as RawIndex<elasticlunr.SerialisedIndexData<{}>>
    store = raw.store
    index = elasticlunr.Index.load(raw.index)
  }

  return {
    search: async (terms) =>
      index.search(terms).map((result: { ref: string }) => store[result.ref]),
  }
}
