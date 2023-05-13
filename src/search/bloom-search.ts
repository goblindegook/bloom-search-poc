import { BloomSearch, DocumentIndex } from '@pacote/bloom-search'
import { decode } from '@msgpack/msgpack'
import { stemmer } from 'stemmer'

type SearchResult = {
  file: string
}

let bs: BloomSearch<SearchResult, keyof SearchResult, never>

export async function getBloomSearch(): Promise<Search> {
  if (bs == null) {
    const response = await fetch('/bloom-search-poc/bloom-search.msgpack')
    const buffer = await response.arrayBuffer()
    const index = decode(buffer) as DocumentIndex<
      SearchResult,
      keyof SearchResult
    >
    bs = new BloomSearch<SearchResult, keyof SearchResult, never>({
      errorRate: 0.0001,
      fields: ['file'],
      summary: ['file'],
      stemmer,
    })
    bs.load(index)
  }

  return {
    search: (terms) => bs.search(terms).map((result) => result.file),
  }
}
