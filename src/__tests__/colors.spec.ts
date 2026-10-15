import { describe, it, expect } from 'vitest'
import { colorFor, KNOWN_PEOPLE, PALETTE } from '../colors'

const known = Object.values(KNOWN_PEOPLE)

describe('colorFor', () => {
  it('uses the exact mockup colors for the known group members', () => {
    expect(colorFor('Antonio')).toBe('#2f6fdb')
    expect(colorFor('Llewellyn')).toBe('#c96442')
    expect(colorFor('Nitsan')).toBe('#2e8b57')
    expect(colorFor('Dana')).toBe('#8e44ad')
  })

  it('ignores case and surrounding whitespace', () => {
    expect(colorFor(' antonio ')).toBe('#2f6fdb')
    expect(colorFor('LLEWELLYN')).toBe('#c96442')
  })

  it('gives an unknown person the same fallback color every time', () => {
    expect(colorFor('Zoe')).toBe(colorFor('Zoe'))
    expect(colorFor(' zoe ')).toBe(colorFor('Zoe'))
    expect(PALETTE).toContain(colorFor('Zoe'))
  })

  it('never gives an unknown person one of the known people\'s colors', () => {
    for (const c of PALETTE) expect(known).not.toContain(c)
    for (const name of ['Zoe', 'Bob', 'Maria', 'Kenji', 'Priya', 'Sam', 'Alex', 'Chris'])
      expect(known).not.toContain(colorFor(name))
  })
})
