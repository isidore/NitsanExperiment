import { describe, it, expect } from 'vitest'
import { colorFor, PALETTE } from '../colors'

describe('colorFor', () => {
  it('gives the same person the same color every time', () => {
    expect(colorFor('Antonio')).toBe(colorFor('Antonio'))
  })

  it('ignores case and surrounding whitespace', () => {
    expect(colorFor(' antonio ')).toBe(colorFor('Antonio'))
  })

  it('gives Antonio and Llewellyn different colors from the palette', () => {
    expect(colorFor('Antonio')).not.toBe(colorFor('Llewellyn'))
    expect(PALETTE).toContain(colorFor('Antonio'))
    expect(PALETTE).toContain(colorFor('Llewellyn'))
  })
})
