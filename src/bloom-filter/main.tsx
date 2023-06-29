import './style.css'
import { render } from 'preact'
import { signal } from '@preact/signals'
import cx from 'classnames'
import { Input } from '../components/Input'
import { Search } from '../components/Search'
import { Navigation } from '../components/Navigation'
import { FilterLocation } from '../components/FilterLocation'
import { AddedWord } from '../components/AddedWord'
import { range } from '@pacote/array'
import { hash } from '../hash'

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
  const computeHashes = (token: string) =>
    range(0, hashes.value).map((i) => hash(i, token) % size.value)

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
                size.value = parseInt(event.target.value, 10)
                reset()
              }}
              value={size}
              type="number"
            />
            <Input
              id="hashes"
              label="Hashes"
              onChange={(event: any) => {
                hashes.value = parseInt(event.target.value, 10)
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
              {words.value.map((word) => {
                const isHighlighted = highlighted.value.word === word
                return (
                  <AddedWord
                    value={word}
                    highlighted={isHighlighted}
                    onClick={(event) => {
                      event.preventDefault()
                      highlighted.value = isHighlighted
                        ? { word: '', hashes: [] }
                        : { word, hashes: computeHashes(word) }
                    }}
                  />
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
                searched.value = {
                  word,
                  hashes: word.length ? computeHashes(word) : [],
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
