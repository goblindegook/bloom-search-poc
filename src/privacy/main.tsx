import { faker } from '@faker-js/faker'
import { BloomSearch } from '@pacote/bloom-search'
import { computed, signal } from '@preact/signals'
import { Fragment } from 'preact'
import { Search } from '../components/Search'
import { mount } from '../site'

type UserProfile = {
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
  profiles: UserProfile[],
): BloomSearch<UserProfile, keyof UserProfile> {
  const index = new BloomSearch<UserProfile, keyof UserProfile>({
    errorRate: 0.000001,
    tokenizer,
    fields: ['firstName', 'lastName', 'phoneNumber', 'email', 'address'],
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

function anonymize(profile: UserProfile): void {
  const REDACTION = '•'.repeat(8)
  profile.lastName = `${profile.lastName[0]}.`
  profile.phoneNumber =
    REDACTION + profile.phoneNumber.replace(/.*(\d{4})$/, '$1')
  const [local, domain] = profile.email.split('@')
  profile.email = `${local[0]}${REDACTION}@${domain}`
  profile.address = REDACTION
}

function generateProfile(): UserProfile {
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

function generateProfiles(count: number): UserProfile[] {
  return Array.from({ length: count }, generateProfile)
}

function toBase64(signatures: Record<number, { filter: Uint32Array }>): string {
  return Object.values(signatures).reduce((result, { filter }) => {
    const a = new Uint32Array(filter)
    return (
      result +
      btoa(
        Array.from(new Uint8Array(a.buffer))
          .map((byte) => String.fromCharCode(byte))
          .join(''),
      )
    )
  }, '')
}

function Profile({
  signature,
  firstName,
  lastName,
  phoneNumber,
  email,
  address,
}: UserProfile & { signature?: string }) {
  return (
    <article class="border-t border-rule py-3">
      <h3 class="truncate text-lg font-semibold tracking-normal">
        {firstName} {lastName}
      </h3>
      <dl class="grid grid-cols-[4.5rem_1fr] gap-x-3 text-[0.95rem]">
        <dt class="label">Phone</dt>
        <dd class="truncate">{phoneNumber}</dd>
        <dt class="label">Email</dt>
        <dd class="truncate">{email}</dd>
        <dt class="label">Address</dt>
        <dd class="truncate">{address}</dd>
        {signature && (
          <>
            <dt class="label">Signature</dt>
            <dd class="readout truncate text-ink-2" title={signature}>
              {signature}
            </dd>
          </>
        )}
      </dl>
    </article>
  )
}

function App() {
  const hasQuery = searchTerms.value.length > 0
  const originals = new Map(profiles.value.map((p) => [p.id, p]))
  // One row per person, so each original sits level with its indexed form.
  const rows = hasQuery
    ? Object.values(results.value).map((summary) => ({
        summary,
        signature: undefined,
      }))
    : Object.values(searchIndex.value.index.documents).map(
        ({ summary, signatures }) => ({
          summary,
          signature: toBase64(signatures),
        }),
      )

  return (
    <>
      <Search
        id="search"
        label="Search names, phone numbers, emails, addresses"
        placeholder="e.g. a surname or a street"
        value={searchTerms.value}
        onInput={(event) => {
          const target = event.target as HTMLInputElement
          searchTerms.value = target.value ?? ''
        }}
      />

      <div class="grid gap-x-10 lg:grid-cols-2">
        <h2 class="label hidden pb-2 lg:block">Original data</h2>
        <h2 class="label hidden pb-2 lg:block">
          {hasQuery ? `Results from index (${rows.length})` : 'Stored index'}
        </h2>
        {hasQuery && rows.length === 0 && (
          <p class="border-t border-rule pt-3 lg:col-start-2">No matches.</p>
        )}
        {rows.map(({ summary, signature }) => (
          <Fragment key={summary.id}>
            <div class="min-w-0">
              <span class="label lg:hidden">Original data</span>
              <Profile {...(originals.get(summary.id) as UserProfile)} />
            </div>
            <div class="min-w-0">
              <span class="label lg:hidden">Index</span>
              <Profile signature={signature} {...summary} />
            </div>
          </Fragment>
        ))}
      </div>
    </>
  )
}

mount(<App />)
