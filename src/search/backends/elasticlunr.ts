import { Index, SerialisedIndexData } from 'elasticlunr'
import { SearchBackend, Store, fetchIndex } from './search'

let store: Store
let index: Index<{}>
let size: number
let gzippedSize: number
let isLoading = false

export async function getElasticlunr(): Promise<SearchBackend> {
  if (!isLoading && (store == null || index == null)) {
    isLoading = true
    const raw = await fetchIndex<SerialisedIndexData<{}>>('elasticlunr')
    store = raw.store
    index = Index.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
    isLoading = false
  }

  return {
    isLoading,
    name: 'elasticlunr',
    title: 'Elasticlunr',
    url: 'https://www.npmjs.com/package/elasticlunr',
    search: (terms) =>
      index.search(terms).map((result: { ref: string }) => store[result.ref]),
    size,
    gzippedSize,
  }
}
