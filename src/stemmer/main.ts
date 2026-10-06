import { stemmer } from 'stemmer'

const term = document.getElementById('term') as HTMLInputElement
const stem = document.getElementById('stem') as HTMLElement

term.addEventListener('input', () => {
  // A space keeps the row as tall as the input when the field is empty.
  stem.textContent = stemmer(term.value) || '\u00a0'
})
