import MiniSearch from 'minisearch'
import { Search, fetchIndex } from './search'
import { stemmer } from 'stemmer'

let index: MiniSearch
let size: number
let gzippedSize: number
let isLoading = false

export async function getMiniSearch(): Promise<Search> {
  if (!isLoading && index == null) {
    isLoading = true
    const raw = await fetchIndex<object>('minisearch')
    index = MiniSearch.loadJSON(JSON.stringify(raw.index), {
      fields: ['file', 'content'],
      processTerm: (term) => stemmer(term.toLowerCase()),
    })
    size = raw.size
    gzippedSize = raw.gzippedSize
  }

  return {
    search: (terms) => index.search(terms).map((result) => result.id),
    size,
    gzippedSize,
  }
}
