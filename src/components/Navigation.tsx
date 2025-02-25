import { ComponentChildren } from 'preact'

type NavigationItemProps = {
  children: ComponentChildren
  href: string
}

const NavigationItem = (props: NavigationItemProps) => (
  <li class="inline-block pr-8">
    <a href={props.href} class="text-blue-600">
      {props.children}
    </a>
  </li>
)

export const Navigation = () => (
  <nav class="border-b px-8 py-4 mb-4 bg-white shadow-sm">
    <ul>
      <NavigationItem href="/bloom-search-poc/index.html">
        Comparison
      </NavigationItem>
      <NavigationItem href="/bloom-search-poc/bloom-filter.html">
        Bloom Filter
      </NavigationItem>
      <NavigationItem href="/bloom-search-poc/counting-bloom-filter.html">
        Counting Bloom Filter
      </NavigationItem>
      <NavigationItem href="/bloom-search-poc/stemmer.html">
        Stemmer
      </NavigationItem>
      <NavigationItem href="/bloom-search-poc/privacy.html">
        Privacy
      </NavigationItem>
      <NavigationItem href="https://github.com/goblindegook/bloom-search-poc">
        Source Code
      </NavigationItem>
    </ul>
  </nav>
)
