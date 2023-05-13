import { BloomSearch, DocumentIndex } from '@pacote/bloom-search'
import { decode } from '@msgpack/msgpack'
import { stemmer } from 'stemmer'

type SearchResult = {
  file: string
}

let bs: BloomSearch<SearchResult, keyof SearchResult, never>
let size = 0
let gzippedSize = 0

export async function getBloomSearch(): Promise<Search> {
  if (bs == null) {
    const response = await fetch('/bloom-search-poc/bloom-search.msgpack')
    const buffer = await response.arrayBuffer()
    const raw = decode(buffer) as {
      index: DocumentIndex<SearchResult, keyof SearchResult>
      size: number
      gzippedSize: number
    }
    bs = new BloomSearch<SearchResult, keyof SearchResult, never>({
      errorRate: 0.0001,
      fields: ['file'],
      summary: ['file'],
      stemmer,
    })
    bs.load(raw.index)
    size = raw.size
    gzippedSize = raw.gzippedSize
  }

  return {
    search: (terms) => bs.search(terms).map((result) => result.file),
    size,
    gzippedSize,
  }
}
