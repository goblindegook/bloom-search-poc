import './style.css'
import { render } from 'preact'
import { signal } from '@preact/signals'
import { Input } from '../components/Input'
import { Navigation } from '../components/Navigation'
import { stemmer } from 'stemmer'

const term = signal('example')

function App() {
  return (
    <>
      <Navigation />
      <div class="p-8">
        <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
          Stemmer
        </h1>
        <div class="grid grid-cols-[1fr_2rem_1fr] gap-8">
          <Input
            id="term"
            onKeyUp={(event: any) => {
              term.value = event.target.value ?? ''
            }}
            value={term}
            type="text"
          />
          <div class="text-3xl leading-none tracking-tight text-gray-400 text-center align-middle">
            &rarr;
          </div>
          <div class="text-xl">{stemmer(term.value)}</div>
        </div>
      </div>
    </>
  )
}

render(<App />, document.getElementById('app')!)
