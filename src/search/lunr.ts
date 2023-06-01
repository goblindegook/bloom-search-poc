import lunr from 'lunr'
import { SearchBackend, Store, fetchIndex } from './search'

let store: Store
let index: lunr.Index
let size: number
let gzippedSize: number
let isLoading = false

export async function getLunr(): Promise<SearchBackend> {
  if (!isLoading && (store == null || index == null)) {
    isLoading = true
    const raw = await fetchIndex<object>('lunr')
    store = raw.store
    index = lunr.Index.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
  }

  return {
    search: (terms) => index.search(terms).map((result) => store[result.ref]),
    size,
    gzippedSize,
  }
}
