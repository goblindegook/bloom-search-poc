import React from 'preact/compat'
import cx from 'classnames'

type FilterLocationProps = {
  index: number
  value: boolean | number
  highlighted?: boolean
  searched?: boolean
}

export const FilterLocation = ({
  index,
  value,
  highlighted,
  searched,
}: FilterLocationProps) => {
  const hasValue = Boolean(value)

  return (
    <li
      class={cx(
        'border-4 rounded-md shadow-md h-12 w-12 relative',
        {
          'bg-yellow-400': highlighted,
          'bg-slate-200': !hasValue,
          'bg-slate-500': !highlighted && hasValue,
        },
        searched
          ? {
              'border-emerald-400': hasValue,
              'border-rose-600': !hasValue,
            }
          : 'border-transparent'
      )}
    >
      {typeof value === 'number' && (
        <div
          class={cx('text-center align-middle font-bold text-2xl leading-10', {
            'text-emerald-400': searched && hasValue,
            'text-rose-600': searched && !hasValue,
            'text-slate-600': highlighted || !hasValue,
            'text-white': highlighted && hasValue,
          })}
        >
          {value}
        </div>
      )}
      <div class="absolute shadow-md bottom-0 right-0 rounded-full bg-white p-1 text-xs text-slate-600 text-center align-baseline w-6 h-6 translate-y-1/2 translate-x-1/2">
        {index}
      </div>
    </li>
  )
}
