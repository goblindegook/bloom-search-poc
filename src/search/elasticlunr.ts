import { Index, SerialisedIndexData } from 'elasticlunr'
import { Search, Store, fetchIndex } from './search'

let store: Store
let index: Index<{}>
let size: number
let gzippedSize: number
let isLoading = false

export async function getElasticlunr(): Promise<Search> {
  if (!isLoading && (store == null || index == null)) {
    isLoading = true
    const raw = await fetchIndex<SerialisedIndexData<{}>>('elasticlunr')
    store = raw.store
    index = Index.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
  }

  return {
    search: (terms) =>
      index.search(terms).map((result: { ref: string }) => store[result.ref]),
    size,
    gzippedSize,
  }
}
