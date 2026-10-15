export const personKey = (name: string): string => name.trim().toLowerCase()

// Exact colors from the mockup (mockup/shared-calendar.html) for the known group members.
export const KNOWN_PEOPLE: Readonly<Record<string, string>> = {
  antonio: '#2f6fdb',
  llewellyn: '#c96442',
  nitsan: '#2e8b57',
  dana: '#8e44ad',
}

// Fallback colors for anyone else. Readable with white text and deliberately
// excludes the known people's colors so an unknown person never looks like one of them.
export const PALETTE = [
  '#c0392b', // red
  '#00838f', // teal
  '#b7700a', // amber
  '#5d6d7e', // slate
  '#ad1457', // magenta
  '#6b7a1f', // olive
] as const

export function colorFor(name: string): string {
  const key = personKey(name)
  const known = KNOWN_PEOPLE[key]
  if (known) return known
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]!
}
