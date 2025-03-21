#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { stemmer } from 'stemmer'
import { BloomSearch } from '@pacote/bloom-search'
import elasticlunr from 'elasticlunr'
import lunr from 'lunr'
import MiniSearch from 'minisearch'
import { encode } from '@msgpack/msgpack'
import { gzipSizeSync } from 'gzip-size'
import chalk from 'chalk'
// import Fuse from 'fuse.js'
import stopwords from 'stopwords-en' with { type: 'json' }

function reportLatency(prefix, callback) {
  const start = new Date()
  callback()
  const latency = new Date() - start
  console.log(`${prefix} (${chalk.green(`${latency}ms`)})`)
}

function writeIndices(name, data) {
  writeJson(join('public', `${name}.json`), data)
  writeMsgPack(join('public', `${name}.msgpack`), data)
}

function writeJson(path, data) {
  const serializedData = JSON.stringify(data)
  writeFileSync(path, serializedData, { encoding: 'utf8' })
  console.log(
    `  File written to ${chalk.cyan(path)} (${chalk.yellow(`${serializedData.length} bytes`)})`
  )
}

function writeMsgPack(path, data) {
  const serializedData = encode(JSON.parse(JSON.stringify(data)))
  const size = serializedData.byteLength
  const gzippedSize = gzipSizeSync(serializedData, { level: 9 })

  writeFileSync(
    path,
    encode(JSON.parse(JSON.stringify({ size, gzippedSize, ...data })))
  )

  console.log(
    `  File written to ${chalk.cyan(path)} (${chalk.green(`${size} bytes`)} bytes, gzipped ${chalk.greenBright(`${gzippedSize} bytes`)})`
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

console.log(chalk.magenta(chalk.bold('\nBloom Search')))

const bloomSearch = new BloomSearch({
  errorRate: 0.0005,
  fields: { file: 1, content: 1 },
  summary: ['file'],
  preprocess: (text) => String(text),
  stopwords: (term) => term.length > 2 && !stopwords.includes(term),
  stemmer,
})

reportLatency("\n  Indexed all documents", () => {
  documents.forEach((document, index) => {
    reportLatency(`  Indexed ${document.file}`, () => {
      bloomSearch.add(index, document)
    })
  })
})

writeIndices('bloom-search', { index: bloomSearch.index })

// Elasticlunr

console.log(chalk.magenta(chalk.bold('\nElasticlunr')))

const elasticlunrIndex = elasticlunr()
elasticlunr.clearStopWords()
elasticlunr.addStopWords(stopwords)
elasticlunrIndex.setRef('index')
elasticlunrIndex.addField('file')
elasticlunrIndex.addField('content')
elasticlunrIndex.saveDocument(false)

reportLatency("\n  Indexed all documents", () => {
  documents.forEach((document, index) => {
    reportLatency(`  Indexed ${document.file}`, () => {
      elasticlunrIndex.addDoc({ index, ...document })
    })
  })
})

writeIndices('elasticlunr', { store, index: elasticlunrIndex })

// Fuse

// console.log(chalk.magenta(chalk.bold('\nFuse')))

// let fuseIndex

// reportLatency("\n  Indexed all documents", () => {
//   fuseIndex = Fuse.createIndex(['index', 'file', 'content'], documents)
// })

// writeIndices('fuse', { store, index: fuseIndex })

// Lunr

console.log(chalk.magenta(chalk.bold('\nLunr')))

const lunrIndex = lunr(function () {
  lunr.generateStopWordFilter(stopwords)
  this.ref('index')
  this.field('file', { boost: 2 })
  this.field('content')

  reportLatency("\n  Indexed all documents", () => {
    documents.forEach((document, index) => {
      reportLatency(`  Indexed ${document.file}`, () => {
        this.add({ index, ...document })
      })
    })
  })
})

writeIndices('lunr', { store, index: lunrIndex })

// MiniSearch

console.log(chalk.magenta(chalk.bold('\nMiniSearch')))

const miniSearchIndex = new MiniSearch({
  fields: ['file', 'content'],
  storeFields: ['file'],
  idField: 'file',
  processTerm: (term) => {
    const processedTerm = stemmer(term)
    return stopwords.includes(processedTerm) ? null : processedTerm
  },
})

reportLatency('  Indexed all documents', () => {
  miniSearchIndex.addAll(documents)
})

writeIndices('minisearch', { index: miniSearchIndex })
