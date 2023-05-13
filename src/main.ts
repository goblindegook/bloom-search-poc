import './style.css'
import { getBloomSearch } from './search/bloom-search'
import { getLunr } from './search/lunr'
import { getElasticlunr } from './search/elasticlunr'

const input = document.querySelector('#search') as HTMLInputElement

input.addEventListener('input', searchHandler)
input.addEventListener('change', searchHandler)
input.addEventListener('keyup', searchHandler)
input.addEventListener('click', searchHandler)

async function searchHandler(event: Event): Promise<void> {
  const terms = (event.target as HTMLInputElement).value || ''

  const bloomSearch = await getBloomSearch()
  renderResults('#bloom-search-results', bloomSearch.search(terms))

  const elasticlunr = await getElasticlunr()
  renderResults('#elasticlunr-results', elasticlunr.search(terms))

  const lunr = await getLunr()
  renderResults('#lunr-results', lunr.search(terms))
}

function renderResults(selector: string, files: string[]): void {
  const container = document.querySelector(selector)
  if (container) {
    container.innerHTML = files.reduce(
      (html, file) =>
        html +
        `<li>
          <article class="search-result-single">
            <a href="/bloom-search-poc/documents/${file}">${file}</a>
          </article>
        </li>`,
      ''
    )
  }
}
