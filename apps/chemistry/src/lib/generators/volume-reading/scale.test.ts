import { describe, expect, it } from 'vitest'
import { marks } from '$lib/shared/marks'
import { formatReading, randomReading, roundReading, volumeScale } from './scale'

describe('graduated cylinder marks', () => {
  it.each([
    ['10', 10, 1, 0.1, 2],
    ['25', 25, 1, 0.5, 2],
    ['50', 50, 10, 1, 1],
    ['100', 100, 10, 1, 1],
    ['250', 250, 20, 2, 1],
    ['1000', 1000, 100, 10, 0],
  ] as const)('%s mL: labeled every %s, minor every %s, read to %s decimals', (size, capacity, label, minor, decimals) => {
    const s = volumeScale({ instrument: 'cylinder', size, beaker: 'medium' })
    expect(s).toMatchObject({ capacity, labelEvery: label, minorEvery: minor, decimals, readsDown: false })
  })
})

describe('the 25 mL graduated cylinder', () => {
  it('has 0.5 mL marks between numbers every 1 mL, with no mark at 2.5 standing out', () => {
    const s = volumeScale({ instrument: 'cylinder', size: '25', beaker: 'medium' })
    const list = marks({ max: s.capacity, labelEvery: s.labelEvery, minorEvery: s.minorEvery })
    expect(list.flatMap((m) => m.label ?? []).slice(0, 4)).toEqual(['0', '1', '2', '3'])
    expect(list.find((m) => m.value === 2.5)).toEqual({ value: 2.5, kind: 'minor' })
    expect(list.some((m) => m.kind === 'medium')).toBe(false)
  })
})

describe('the big graduated cylinders', () => {
  const cyl250 = volumeScale({ instrument: 'cylinder', size: '250', beaker: 'medium' })
  const cyl1000 = volumeScale({ instrument: 'cylinder', size: '1000', beaker: 'medium' })

  it('the 250 mL is marked from 10 mL up, numbered 10, 30, 50… 250', () => {
    expect(cyl250.lowest).toBe(10)
    const labels = marks({ from: cyl250.lowest, max: 250, labelEvery: cyl250.labelEvery, minorEvery: cyl250.minorEvery }).flatMap((m) => m.label ?? [])
    expect(labels).toEqual(['10', '30', '50', '70', '90', '110', '130', '150', '170', '190', '210', '230', '250'])
  })

  it('the 250 mL can’t read below its lowest mark', () => {
    expect(roundReading(cyl250, 4)).toBe(10)
    expect(randomReading(cyl250, () => 0)).toBeGreaterThanOrEqual(10)
  })

  it('the 1000 mL is marked from 0, numbered every 100 mL up to 1000', () => {
    expect(cyl1000.lowest).toBe(0)
    expect(marks({ max: 1000, labelEvery: cyl1000.labelEvery, minorEvery: cyl1000.minorEvery }).at(-1)).toMatchObject({ value: 1000, kind: 'major', label: '1000' })
  })

  it('give the 1000 mL a medium mark every 50 mL', () => {
    const list = marks({ max: 1000, labelEvery: cyl1000.labelEvery, minorEvery: cyl1000.minorEvery })
    expect(list.filter((m) => m.kind === 'medium').map((m) => m.value).slice(0, 3)).toEqual([50, 150, 250])
  })

  it('round readings to the estimated digit', () => {
    expect(roundReading(cyl250, 143.27)).toBe(143.3)
    expect(roundReading(cyl1000, 642.6)).toBe(643)
    expect(formatReading(cyl1000, 640)).toBe('640')
  })
})

describe('buret marks', () => {
  it('is 50 mL read downward, labeled every 1 mL, minor every 0.1, read to 0.01', () => {
    expect(volumeScale({ instrument: 'buret', size: '10', beaker: 'medium' })).toEqual({ capacity: 50, lowest: 0, labelEvery: 1, minorEvery: 0.1, decimals: 2, readsDown: true })
  })
})

describe('beaker marks', () => {
  it.each([
    ['small', 50, 10, 10],
    ['medium', 250, 50, 25],
    ['large', 600, 100, 50],
  ] as const)('%s is %s mL, labeled every %s, minor every %s, read to the whole mL', (beaker, capacity, label, minor) => {
    const s = volumeScale({ instrument: 'beaker', size: '100', beaker })
    expect(s).toEqual({ capacity, lowest: 0, labelEvery: label, minorEvery: minor, decimals: 0, readsDown: false })
  })
})

describe('the reading', () => {
  const cyl100 = volumeScale({ instrument: 'cylinder', size: '100', beaker: 'medium' })
  const buret = volumeScale({ instrument: 'buret', size: '100', beaker: 'medium' })
  const beaker = volumeScale({ instrument: 'beaker', size: '100', beaker: 'large' })

  it('rounds to the estimated digit', () => {
    expect(roundReading(cyl100, 43.27)).toBe(43.3)
    expect(roundReading(buret, 23.475)).toBe(23.48)
    expect(roundReading(buret, 0.004)).toBe(0)
    expect(roundReading(beaker, 347.6)).toBe(348)
  })

  it('stays within the instrument', () => {
    expect(roundReading(cyl100, 140)).toBe(100)
    expect(roundReading(buret, -2)).toBe(0)
  })

  it('is written with every decimal place, including trailing zeros', () => {
    expect(formatReading(buret, 23.4)).toBe('23.40')
    expect(formatReading(cyl100, 40)).toBe('40.0')
    expect(formatReading(beaker, 350)).toBe('350')
  })

  it('can be picked at random, always a valid reading', () => {
    for (const r of [0, 0.3, 0.999999]) {
      const v = randomReading(buret, () => r)
      expect(v).toBe(roundReading(buret, v))
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThan(50)
    }
    expect(randomReading(cyl100, () => 0.5)).toBe(52.5)
  })
})
