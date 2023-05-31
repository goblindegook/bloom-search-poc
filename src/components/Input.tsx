import React from 'preact/compat'

type InputProps = React.JSX.HTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
}

export const Input = ({ id, label, ...props }: InputProps) => (
  <div class="pb-6">
    <label for={id} class="block mb-2 text-sm font-medium text-gray-900">
      {label}
    </label>
    <input
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      id={id}
      {...props}
    />
  </div>
)
