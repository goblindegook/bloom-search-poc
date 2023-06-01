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
const filter = signal<boolean[]>(Array(size.value).fill(false))
const highlighted = signal<{ word: string; hashes: number[] }>({
  word: '',
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
    filter.value = Array(size.value).fill(false)
    highlighted.value = { word: '', hashes: [] }
  }

  const isWordSearched = searched.value.word.length > 0
  const isWordFound = searched.value.hashes.every(
    (index) => filter.value[index]
  )

  return (
    <>
      <Navigation />
      <div class="p-8">
        <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
          Bloom Filter
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
                  const locations = computeHashes(word)
                  words.value = words.value.concat(word)
                  locations.forEach((location) => {
                    filter.value[location] = true
                  })
                  highlighted.value = { word, hashes: locations }
                  event.target.value = ''
                }
              }}
            />

            <ul>
              {words.value.map((word) => (
                <li class="inline">
                  <button
                    class={cx(
                      'border focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-1 mr-2 mb-2',
                      highlighted.value.word === word
                        ? 'text-white border-yellow-400 bg-yellow-400 hover:bg-yellow-300'
                        : 'text-gray-900 border-gray-300 bg-white hover:bg-gray-100'
                    )}
                    onClick={(event) => {
                      if (word === highlighted.value.word) {
                        highlighted.value = { word: '', hashes: [] }
                      } else {
                        highlighted.value = {
                          word,
                          hashes: computeHashes(word),
                        }
                      }
                      event.preventDefault()
                    }}
                  >
                    {word}
                  </button>
                </li>
              ))}
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
                    isWordFound ? 'bg-emerald-700' : 'bg-rose-700'
                  )}
                >
                  {isWordFound ? 'Probably found' : 'Definitely missing'}
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
