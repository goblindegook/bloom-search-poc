type ProfileProps = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
  signature?: string
}

export function Profile({
  signature,
  firstName,
  lastName,
  phoneNumber,
  email,
  address,
}: ProfileProps) {
  return (
    <div className="border rounded p-4 bg-white shadow relative">
      {signature ? (
        <div
          class="absolute top-0 right-0 m-2 p-2 rounded-full bg-blue-200 hover:cursor-pointer"
          title={signature}
        >
          ✍️
        </div>
      ) : (
        ''
      )}
      <h3 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
        {firstName} {lastName}
      </h3>
      <p className="text-gray-600">📞 {phoneNumber}</p>
      <p className="text-gray-600">✉️ {email}</p>
      <p className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
        🏠 {address}
      </p>
    </div>
  )
}
