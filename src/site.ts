import { type ComponentChild, render } from 'preact'

export const BASE = import.meta.env.BASE_URL

export const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

/** Renders an island into the #app element of a static page. */
export const mount = (app: ComponentChild) =>
  render(app, document.getElementById('app') as HTMLElement)
