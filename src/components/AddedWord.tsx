import cx from 'classnames'

type AddedWordProps = {
  value: string
  highlighted?: boolean
  onClick(event: React.JSX.TargetedMouseEvent<HTMLButtonElement>): void
  onRemove?(event: React.JSX.TargetedMouseEvent<HTMLButtonElement>): void
}

export const AddedWord = ({
  value,
  highlighted,
  onClick,
  onRemove,
}: AddedWordProps) => {
  const isRemovable = typeof onRemove === 'function'
  const baseClass =
    'focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium text-sm py-1 mb-2'

  return (
    <li class="inline whitespace-nowrap mr-2">
      <button
        class={cx(
          baseClass,
          'border px-4',
          highlighted
            ? 'text-white border-yellow-500 bg-yellow-400 hover:bg-yellow-500'
            : 'text-gray-900 border-gray-300 bg-white hover:bg-gray-100',
          isRemovable ? 'rounded-l-lg' : 'rounded-lg'
        )}
        onClick={onClick}
      >
        {value}
      </button>
      {isRemovable && (
        <button
          class={cx(
            baseClass,
            'border-r border-y rounded-r-lg px-2',
            highlighted
              ? 'text-white border-yellow-500 bg-yellow-400 hover:bg-yellow-500'
              : 'text-gray-900 border-gray-300 bg-gray-100 hover:bg-gray-200'
          )}
          onClick={onRemove}
        >
          &times;
        </button>
      )}
    </li>
  )
}
