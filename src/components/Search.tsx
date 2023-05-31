import { ComponentChildren } from 'preact'
import React from 'preact/compat'

type SearchProps = {
  id: string
  label: string
  onKeyUp: (event: KeyboardEvent) => void
  children?: ComponentChildren
}

export const Search = (props: SearchProps) => {
  return (
    <div class="mb-6 relative">
      <label for="search" class="sr-only">
        {props.label}
      </label>
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          aria-hidden="true"
          class="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        id={props.id}
        onKeyUp={props.onKeyUp}
        class="block w-full p-4 pl-10 text-xl text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
      />
      {props.children}
    </div>
  )
}
