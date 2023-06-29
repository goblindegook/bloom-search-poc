import cx from 'classnames'
import { ComponentProps } from 'preact'

type InputProps = ComponentProps<'input'> & {
  id: string
  label?: string
  class?: string
}

export const Input = ({
  id,
  label,
  class: classnames,
  ...props
}: InputProps) => (
  <div class="pb-6">
    {label != null && (
      <label for={id} class="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>
    )}
    <input
      class={cx(
        'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5',
        classnames
      )}
      id={id}
      {...props}
    />
  </div>
)
