import './style.css'
import React from 'preact/compat'
import { render } from 'preact'
import { signal } from '@preact/signals'
import { hashLocations } from '@pacote/bloom-filter/src/hash'
import cx from 'classnames'
import { Input } from '../components/Input'
import { Search } from '../components/Search'
import { Navigation } from '../components/Navigation'
import { FilterLocation } from '../components/FilterLocation'

const size = signal<number>(100)
const hashes = signal<number>(3)
const words = signal<string[]>([])
const filter = signal<number[]>(Array(size.value).fill(0))
const highlighted = signal<{ word: string; index: number; hashes: number[] }>({
  word: '',
  index: -1,
  hashes: [],
})
const searched = signal<{ word: string; hashes: number[] }>({
  word: '',
  hashes: [],
})

function App() {
  const computeHashes = hashLocations(size.value, hashes.value, 0)

  const reset = () => {
    words.value = []
    filter.value = Array(size.value).fill(0)
    highlighted.value = { word: '', index: -1, hashes: [] }
  }

  const isWordSearched = searched.value.word.length > 0
  const wordsFound = Math.min(
    ...searched.value.hashes.map((index) => filter.value[index])
  )

  return (
    <>
      <Navigation />
      <div class="p-8">
        <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
          Counting Bloom Filter
        </h1>

        <div class="grid grid-cols-4 gap-8">
          <div class="bg-gray-100 p-8 rounded-lg shadow-sm">
            <Input
              id="size"
              label="Size"
              onChange={(event: any) => {
                size.value = Number(event.target.value)
                reset()
              }}
              value={size}
              type="number"
            />
            <Input
              id="hashes"
              label="Hashes"
              onChange={(event: any) => {
                hashes.value = Number(event.target.value)
                reset()
              }}
              value={hashes}
              type="number"
            />
            <Input
              id="add"
              label="Add Text"
              onKeyUp={(event: any) => {
                if (event.key === 'Enter') {
                  const word = event.target.value
                  if (word.length > 0) {
                    const locations = computeHashes(word)
                    words.value = words.value.concat(word)
                    locations.forEach((location) => {
                      filter.value[location] = filter.value[location] + 1
                    })
                    highlighted.value = {
                      word,
                      index: words.value.length - 1,
                      hashes: locations,
                    }
                  }
                  event.target.value = ''
                }
              }}
            />

            <ul>
              {words.value.map((word, index) => {
                const baseClass =
                  'border focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium text-sm px-4 py-1 mb-2'
                const highlightClass =
                  highlighted.value.index === index
                    ? 'text-white border-yellow-400 bg-yellow-400 hover:bg-yellow-300'
                    : 'text-gray-900 border-gray-300 bg-white hover:bg-gray-100'
                return (
                  <li class="inline whitespace-nowrap">
                    <button
                      class={cx(baseClass, 'rounded-l-lg ml-2', highlightClass)}
                      onClick={(event) => {
                        if (index === highlighted.value.index) {
                          highlighted.value = {
                            word: '',
                            index: -1,
                            hashes: [],
                          }
                        } else {
                          highlighted.value = {
                            word,
                            index,
                            hashes: computeHashes(word),
                          }
                        }
                        event.preventDefault()
                      }}
                    >
                      {word}
                    </button>
                    <button
                      class={cx(baseClass, 'rounded-r-lg mr-2', highlightClass)}
                      onClick={(event) => {
                        const locations = computeHashes(word)
                        locations.forEach((location) => {
                          filter.value[location] = filter.value[location] - 1
                        })
                        words.value = words.value
                          .slice(0, index)
                          .concat(
                            words.value.slice(index + 1, words.value.length)
                          )
                        highlighted.value = { word: '', index: -1, hashes: [] }
                        event.preventDefault()
                      }}
                    >
                      &times;
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div class="col-span-3">
            <Search
              id="search"
              label="Search"
              onKeyUp={(event: any) => {
                const word = event.target.value
                if (word.length) {
                  searched.value = { word, hashes: computeHashes(word) }
                } else {
                  searched.value = { word, hashes: [] }
                }
              }}
            >
              {isWordSearched && (
                <div
                  class={cx(
                    'text-white absolute right-2.5 bottom-2.5 font-medium rounded-lg text-md px-4 py-2',
                    wordsFound > 0 ? 'bg-emerald-700' : 'bg-rose-700'
                  )}
                >
                  {wordsFound > 0
                    ? `Probably found ${wordsFound}`
                    : 'Definitely missing'}
                </div>
              )}
            </Search>

            <ul class="grid grid-cols-10 justify-evenly justify-items-center gap-4 m-12">
              {filter.value.map((value, index) => (
                <FilterLocation
                  value={value}
                  index={index}
                  highlighted={highlighted.value.hashes.includes(index)}
                  searched={
                    isWordSearched && searched.value.hashes.includes(index)
                  }
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

render(<App />, document.getElementById('app')!)
