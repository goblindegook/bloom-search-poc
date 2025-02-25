import './style.css'
import { render } from 'preact'
import { Search } from '../components/Search'
import { computed, signal } from '@preact/signals'
import { Navigation } from '../components/Navigation'
import { faker } from '@faker-js/faker'
import { BloomSearch } from '@pacote/bloom-search'

type Profile = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
}

const profiles = signal(generateProfiles(100))
const searchIndex = computed(() => generateSearchIndex(profiles.value))
const searchTerms = signal('')
const results = computed(() => searchIndex.value.search(searchTerms.value))

const tokenizer = (text: string): string[] =>
  text
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/gi, ' ')
    .split(/\s+/)

function generateSearchIndex(
  profiles: Profile[]
): BloomSearch<Profile, keyof Profile> {
  const index = new BloomSearch<Profile, keyof Profile>({
    errorRate: 0.000001,
    tokenizer,
    fields: ['id', 'firstName', 'lastName', 'phoneNumber', 'email', 'address'],
    summary: ['id', 'firstName', 'lastName', 'phoneNumber', 'email'],
  })
  for (const profile of profiles) {
    index.add(profile.id, profile)
  }
  for (const d of Object.values(index.index.documents)) {
    anonymize(d.summary)
  }
  return index
}

function anonymize(profile: Profile): void {
  const REDACTION = '•'.repeat(8)
  profile.lastName = `${profile.lastName[0]}.`
  profile.phoneNumber =
    REDACTION + profile.phoneNumber.replace(/.*(\d{4})$/, '$1')
  const [local, domain] = profile.email.split('@')
  profile.email = `${local[0]}${REDACTION}@${domain}`
  profile.address = REDACTION
}

function generateProfile(): Profile {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    phoneNumber: faker.phone.number({ style: 'international' }),
    email: faker.internet.email({ firstName, lastName }),
    address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.country()}`,
  }
}

function generateProfiles(count: number): Profile[] {
  const profiles = []
  for (let i = 0; i < count; i++) {
    profiles.push(generateProfile())
  }
  return profiles
}

function toBase64(signatures: Record<number, { filter: Uint32Array }>): string {
  return Object.values(signatures).reduce((result, { filter }) => {
    const a = new Uint32Array(filter)
    return (
      result +
      btoa(
        Array.from(new Uint8Array(a.buffer))
          .map((byte) => String.fromCharCode(byte))
          .join('')
      )
    )
  }, '')
}

type ProfileProps = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
  signature?: string
}

function Profile({
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

function App() {
  return (
    <>
      <Navigation />
      <div class="p-8">
        <h1 class="text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8">
          Privacy
        </h1>
        <section class="grid grid-cols-3">
          <section class="col-span-2 bg-gray-100 border rounded shadow">
            <div class="grid grid-cols-2 px-4 pt-2">
              <h2 className="text-lg font-semibold p-4">Original</h2>
              <h2 className="text-lg font-semibold p-4">Stored</h2>
            </div>
            <div class="flex flex-col h-screen px-2">
              <div class="flex-1 min-h-0 overflow-y-auto grid grid-cols-2">
                <section>
                  {profiles.value.map((profile) => (
                    <div key={profile.id} class="m-4 mt-0">
                      <Profile {...profile} />
                    </div>
                  ))}
                </section>
                <section>
                  {Object.values(searchIndex.value.index.documents).map(
                    ({ summary, signatures }) => (
                      <div key={summary.id} class="m-4 mt-0">
                        <Profile
                          signature={toBase64(signatures)}
                          {...summary}
                        />
                      </div>
                    )
                  )}
                </section>
              </div>
            </div>
          </section>
          <section class="p-8">
            <Search
              id="search"
              label="Search"
              value={searchTerms.value}
              onKeyUp={async (event: any) => {
                searchTerms.value = event.target?.value ?? ''
              }}
            />
            <section>
              {Object.values(results.value).length === 0 ? (
                <p>No results.</p>
              ) : (
                Object.values(results.value).map((summary) => (
                  <div key={summary.id} class="my-4">
                    <Profile {...summary} />
                  </div>
                ))
              )}
            </section>
          </section>
        </section>
      </div>
    </>
  )
}

render(<App />, document.getElementById('app')!)
