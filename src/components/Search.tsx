import { ComponentChildren } from 'preact'
import React, { HTMLAttributes } from 'preact/compat'

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-search w-5 h-5 text-gray-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <input
        class="block w-full p-4 pl-10 text-xl text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        {...props}
      />
      {children}
    </div>
  )
}
