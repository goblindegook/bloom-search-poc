interface Search {
  search(terms: string): string[]
  size: number
  gzippedSize: number
}
