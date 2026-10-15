// Distinct colors that stay readable with white text on top.
export const PALETTE = [
  '#2f6fdb', // blue
  '#c96442', // terracotta
  '#2e8b57', // green
  '#8e44ad', // purple
  '#c0392b', // red
  '#00838f', // teal
  '#b7700a', // amber
  '#5d6d7e', // slate
] as const

export const personKey = (name: string): string => name.trim().toLowerCase()

export function colorFor(name: string): string {
  const key = personKey(name)
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]!
}
