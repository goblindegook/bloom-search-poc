import lunr from 'lunr'
import { decode } from '@msgpack/msgpack'
import { RawIndex, Search, Store } from './search'

let store: Store
let index: lunr.Index

export async function getLunr(): Promise<Search> {
  if (store == null || index == null) {
    const response = await fetch('/bloom-search-poc/lunr.msgpack')
    const buffer = await response.arrayBuffer()
    const raw = decode(buffer) as RawIndex<object>
    store = raw.store
    index = lunr.Index.load(raw.index)
  }

  return {
    search: async (terms) =>
      index.search(terms).map((result) => store[result.ref]),
  }
}
