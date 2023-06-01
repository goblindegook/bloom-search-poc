import { ComponentChildren } from 'preact'
import React from 'preact/compat'

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
      <NavigationItem href="index.html">Comparison</NavigationItem>
      <NavigationItem href="bloom-filter.html">Bloom Filter</NavigationItem>
      <NavigationItem href="counting-bloom-filter.html">
        Counting Bloom Filter
      </NavigationItem>
    </ul>
  </nav>
)
