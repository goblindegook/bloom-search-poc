import { ComponentChildren } from 'preact'
import React, { HTMLAttributes } from 'preact/compat'
import { SearchIcon } from './Icons'

type SearchProps = HTMLAttributes<HTMLInputElement> & {
  label: string
  children?: ComponentChildren
}

export const Search = ({ label, children, ...props }: SearchProps) => {
  return (
    <div class="mb-8 relative">
      <label for="search" class="sr-only">
        {label}
      </label>
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon class="w-5 h-5 text-gray-500" />
      </div>
      <input
        class="block w-full p-4 pl-10 text-xl text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        {...props}
      />
      {children}
    </div>
  )
}
