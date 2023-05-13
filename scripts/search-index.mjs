#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { stemmer } from 'stemmer'
import stopwords from 'stopwords-en' assert { type: 'json' }
import { BloomSearch } from '@pacote/bloom-search'
import elasticlunr from 'elasticlunr'
import lunr from 'lunr'
import { encode } from '@msgpack/msgpack'
import { gzipSizeSync } from 'gzip-size'

function writeJson(path, data) {
  const serializedData = JSON.stringify(data)
  writeFileSync(path, serializedData, { encoding: 'utf8' })
  console.log(`File written to ${path} (${serializedData.length} bytes)`)
}

function writeMsgPack(path, data) {
  const serializedData = encode(JSON.parse(JSON.stringify(data)))
  const size = serializedData.byteLength
  const gzippedSize = gzipSizeSync(serializedData)

  writeFileSync(path, serializedData)

  console.log(
    `File written to ${path} (${size} bytes, gzipped ${gzippedSize} bytes)`
  )
}

const documentPath = join('public', 'documents')
const files = readdirSync(documentPath)
console.log(`Found ${files.length} documents to index`)

const documents = files.map((file) => {
  const content = readFileSync(join(documentPath, file), 'utf8')
  return { file, content }
})

const store = files.reduce(
  (all, file, index) => ({ ...all, [index]: file }),
  {}
)

// Bloom Search

const bloomSearch = new BloomSearch({
  errorRate: 0.001,
  fields: { file: 2, content: 1 },
  summary: ['file'],
  preprocess: (text) => String(text),
  stopwords: (term) => term.length > 2 && !stopwords.includes(term),
  stemmer,
})

documents.forEach((document, index) => {
  const start = new Date()
  bloomSearch.add(index, document)
  const latency = new Date() - start
  console.log(`[Bloom Search] Indexed ${document.file} (${latency}ms)`)
})

writeJson(join('public', 'bloom-search.json'), { index: bloomSearch.index })
writeMsgPack(join('public', 'bloom-search.msgpack'), {
  index: bloomSearch.index,
})

// Elasticlunr

const elasticlunrIndex = elasticlunr()
elasticlunr.clearStopWords()
elasticlunr.addStopWords(stopwords)
elasticlunrIndex.setRef('index')
elasticlunrIndex.addField('file')
elasticlunrIndex.addField('content')
elasticlunrIndex.saveDocument(false)

documents.forEach((document, index) => {
  const start = new Date()
  elasticlunrIndex.addDoc({ index, ...document })
  const latency = new Date() - start
  console.log(`[Elasticlunr] Indexed ${document.file} (${latency}ms)`)
})

writeJson(join('public', 'elasticlunr.json'), {
  store,
  index: elasticlunrIndex,
})
writeMsgPack(join('public', 'elasticlunr.msgpack'), {
  store,
  index: elasticlunrIndex,
})

// Lunr

const lunrIndex = lunr(function () {
  lunr.generateStopWordFilter(stopwords)
  this.ref('index')
  this.field('file', { boost: 2 })
  this.field('content')

  documents.forEach((document, index) => {
    const start = new Date()
    this.add({ index, ...document })
    const latency = new Date() - start
    console.log(`[Lunr] Indexed ${document.file} (${latency}ms)`)
  })
})

writeJson(join('public', 'lunr.json'), { store, index: lunrIndex })
writeMsgPack(join('public', 'lunr.msgpack'), { store, index: lunrIndex })
