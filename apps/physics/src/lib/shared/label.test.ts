import { describe, expect, test } from 'vitest'
import { Editor } from '@caret-js/core'
import { SHORTCUTS, baselineBelowMiddle, commands, decodeLabel, encodeLabel, italicPieces, labelFromText, labelRuns, labelToText, schema, typeLabel, typingRules, type Label } from './label'

describe('typing a label', () => {
  test.each([
    ['theta', 'θ'],
    ['30deg', '30°'],
    ['mu_k', 'μ_k'],
    ['Deltax', 'Δx'],
    ['2 kg', '2 kg'],
    ['omega', 'ω'],
    ['Omega', 'Ω'],
    ['4 ohm', '4 Ω'],
  ])('%s shows as %s', (typed, shown) => {
    expect(typeLabel(typed)).toBe(shown)
  })
})

describe('label text for the page address', () => {
  test.each([
    ['m_1', 'm_1'],
    ['F_N', 'F_N'],
    ['θ', 'theta'],
    ['30°', '30deg'],
    ['μ_k', 'mu_k'],
    ['v_{0x}', 'v_{0x}'],
    ['5 kg', '5 kg'],
    ['2.0 m/s^2', '2.0 m/s^2'],
    ['x^{-1}', 'x^{-1}'],
    ['Δx', 'Deltax'],
    ['30^o', '30deg'],
    ['E^{o}', 'Edeg'],
    ['x^2', 'x^2'],
  ])('%s', (text, expected) => {
    const once = labelToText(labelFromText(text))
    expect(once).toBe(expected)
    expect(labelToText(labelFromText(once))).toBe(once)
  })
})

describe('typing in the field', () => {
  const SUP = SHORTCUTS.superscript
  const SUB = SHORTCUTS.subscript
  const typed = (keys: string, start = '') => {
    const editor = new Editor<any>(schema, { typingRules, commands })
    editor.load(labelFromText(start))
    editor.type(keys)
    return labelToText(editor.doc)
  }

  test.each([
    ['30^o', '30deg'],
    ['30^oC', '30degC'],
    ['x^2', 'x^2'],
    ['F_N', 'F_N'],
    // Google Docs' Ctrl+. and Ctrl+, switch a box on, and off again.
    [`x${SUP}2${SUP}+1`, 'x^2+1'],
    [`v${SUB}0${SUB}t`, 'v_0t'],
    [`F${SUB}N${SUP}2`, 'F_N^2'],
    [`30${SUP}o${SUP}C`, '30degC'],
  ])('%s', (keys, text) => {
    expect(typed(keys)).toBe(text)
  })

  test('a shortcut with text selected puts the selection in the box', () => {
    const editor = new Editor<any>(schema, { typingRules, commands })
    editor.load(labelFromText('Fair'))
    editor.select({ strandId: '[ROOT]', anchorIndex: 1, headIndex: 4 })
    editor.type(`${SUB}x`)
    expect(labelToText(editor.doc)).toBe('F_{air}x')
  })
})

describe('runs for drawing a label', () => {
  test('subscripts and superscripts', () => {
    expect(labelRuns('F_N')).toEqual([
      { text: 'F', shift: null },
      { text: 'N', shift: 'sub' },
    ])
    expect(labelRuns('mu_k')).toEqual([
      { text: 'μ', shift: null },
      { text: 'k', shift: 'sub' },
    ])
    expect(labelRuns('2.0 m/s^2')).toEqual([
      { text: '2.0 m/s', shift: null },
      { text: '2', shift: 'super' },
    ])
    expect(labelRuns('v_{0x} = 3deg')).toEqual([
      { text: 'v', shift: null },
      { text: '0x', shift: 'sub' },
      { text: ' = 3°', shift: null },
    ])
  })
})

describe('a label in the page address', () => {
  const cases: [Label, string][] = [
    [{ mode: 'text', text: 'm_1' }, 'm_1'],
    [{ mode: 'blank', text: 'default' }, '~'],
    [{ mode: 'none', text: 'default' }, ''],
    [{ mode: 'text', text: '~x' }, '~~x'],
    [{ mode: 'text', text: '' }, '~_'],
    [{ mode: 'text', text: '~_' }, '~~_'],
  ]
  test.each(cases)('%o', (label, raw) => {
    expect(encodeLabel(label)).toBe(raw)
    expect(decodeLabel(raw, { mode: 'text', text: 'default' })).toEqual(label)
  })

  test('a missing label is the default, and blank drops its text from the address', () => {
    expect(encodeLabel({ mode: 'blank', text: 'm_1' })).toBe('~')
    expect(decodeLabel(null, { mode: 'text', text: 'θ' })).toEqual({ mode: 'text', text: 'θ' })
  })
})

describe('italics', () => {
  const italic = (text: string) => italicPieces(text).filter((p) => p.italic).map((p) => p.text)
  test('quantities in italics, units and words upright', () => {
    expect(italic('mg')).toEqual(['mg'])
    expect(italic('v')).toEqual(['v'])
    expect(italic('θ')).toEqual(['θ'])
    expect(italic('5 kg')).toEqual([])
    expect(italic('20 cm')).toEqual([])
    expect(italic('block')).toEqual([])
    expect(italic('F = ma')).toEqual(['F', 'ma'])
  })

  test('a short word after a number and a space is a unit', () => {
    expect(italic('12 V')).toEqual([])
    expect(italic('4 Ω')).toEqual([])
    expect(italic('4Ω')).toEqual([])
    expect(italic('I = 2 A')).toEqual(['I'])
    expect(italic('V = 5 N')).toEqual(['V'])
    expect(italic('T = 30°C')).toEqual(['T'])
    // With no space it's still a product of quantities.
    expect(italic('2mg')).toEqual(['mg'])
    expect(italic('R_x')).toEqual(['R', 'x'])
  })
})

describe('centering a label on a point', () => {
  const text = (t: string) => ({ mode: 'text' as const, text: t })
  test('a capital sits lower than a lowercase letter, and a subscript lifts the label further', () => {
    const [F, m, m1] = [text('F'), text('m'), text('m_1')].map((l) => baselineBelowMiddle(l, 22))
    expect(F).toBeCloseTo(22 * 0.34, 1)
    expect(m).toBeLessThan(F)
    expect(m1).toBeLessThan(m)
    expect(m1).toBeGreaterThan(0)
  })

  test('a blank or missing label takes the offset a capital would', () => {
    expect(baselineBelowMiddle({ mode: 'blank', text: 'm' }, 20)).toBe(7)
    expect(baselineBelowMiddle(text(' '), 20)).toBe(7)
  })
})
