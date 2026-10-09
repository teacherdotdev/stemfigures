import { describe, expect, test } from 'vitest'
import { DEFAULT_SETTINGS, cleanSettings, pointNameList, readLines, settingsFromParams, settingsToQuery } from './settings.js'

const params = (q: string) => settingsFromParams(new URLSearchParams(q))
const read = (q: string) => readLines(params(q))

describe('the page address', () => {
  test('the opening figure has a bare address', () => {
    expect(settingsToQuery(cleanSettings(DEFAULT_SETTINGS))).toBe('')
  })

  test('a link comes back the same', () => {
    const q = 'angle=50&parallel=0&tilt=-8&second=1&angle2=110&shift=-1.25&line1=l&rotate=20&a2Label=measure&a3Arcs=2&a6Text=3x%2B5&a7Shade=1'
    expect(settingsToQuery(params(q))).toBe(q)
  })

  test('nonsense falls back to defaults, and slides stay in range', () => {
    const s = params('tilt=99&shift=7&a1Label=bold&a1Arcs=9&a1Shade=12&arrows=5&rotate=999')
    expect([s.tilt, s.shift, s.a1Label, s.a1Arcs, s.a1Shade, s.arrows, s.rotate]).toEqual([30, 3, 'text', 0, 0, 1, 180])
    expect(params('shift=0.6').shift).toBe(0.5)
  })

  test('every angle opens numbered', () => {
    const s = cleanSettings(DEFAULT_SETTINGS)
    expect([s.a1Label, s.a1Text, s.a8Text, s.a16Text]).toEqual(['text', '1', '8', '16'])
  })

  test('point names are split on spaces or commas', () => {
    expect(pointNameList(params('pointNames=P,%20Q%20%20R'))).toEqual(['P', 'Q', 'R'])
  })
})

describe('readLines', () => {
  test('parallel lines: corresponding and alternate angles match, linear pairs add to 180°', () => {
    const m = read('angle=65').lines!.measures
    expect([m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]]).toEqual([115, 65, 65, 115, 115, 65, 65, 115])
  })

  test('not parallel: the bottom angles follow the second line’s tilt', () => {
    const m = read('angle=65&parallel=0&tilt=10').lines!.measures
    expect([m[2], m[6], m[5]]).toEqual([65, 55, 125])
  })

  test('the tilt only counts when the lines aren’t parallel', () => {
    expect(read('angle=65&tilt=10').lines!.measures[6]).toBe(65)
  })

  test('a second transversal’s angles are 9 to 16', () => {
    const m = read('second=1&angle2=120').lines!.measures
    expect([m[9], m[10], m[16]]).toEqual([60, 120, 60])
    expect(read('').lines!.measures[9]).toBeUndefined()
  })

  test('a right angle', () => {
    expect(read('angle=90').lines!.measures[1]).toBe(90)
  })

  test('angles that can’t be drawn', () => {
    expect(read('angle=').problem).toBe('Give the angle a measure.')
    expect(read('angle=x').problem).toMatch(/Type a number/)
    expect(read('angle=190').problem).toMatch(/between 0° and 180°/)
    expect(read('angle=5').problem).toMatch(/between 10° and 170°/)
    expect(read('angle=20&parallel=0&tilt=15')).toMatchObject({ lines: null, field: 'angle' })
    expect(read('second=1&angle2=abc')).toMatchObject({ lines: null, field: 'angle2' })
  })

  test('two transversals can’t share a crossing', () => {
    expect(read('second=1&shift=0')).toMatchObject({ lines: null, field: 'shift' })
    // Crossing m apart but meeting on n.
    expect(read('second=1&angle=135&angle2=45&shift=2')).toMatchObject({ lines: null, field: 'shift' })
  })

  test('lines that meet before the transversal crosses them both', () => {
    expect(read('parallel=0&tilt=30&second=1&angle2=60&shift=3')).toMatchObject({ lines: null, field: 'shift', problem: expect.stringMatching(/meet before/) })
  })
})
