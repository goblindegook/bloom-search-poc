import cx from 'clsx'
import type { ComponentChildren, ComponentProps } from 'preact'

type SearchProps = ComponentProps<'input'> & {
  id: string
  label: string
  /** The magnifier; turn it off when the field is not a search. */
  magnifier?: boolean
  children?: ComponentChildren
}

export const Search = ({
  id,
  label,
  magnifier = true,
  children,
  ...props
}: SearchProps) => (
  <div class="mb-8">
    <label for={id} class="label mb-2 block">
      {label}
    </label>
    <div class="relative">
      {magnifier && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )}
      <input
        id={id}
        type="search"
        autocomplete="off"
        spellcheck={false}
        class={cx('big-field', magnifier && 'pl-14')}
        {...props}
      />
    </div>
    {children}
  </div>
)
