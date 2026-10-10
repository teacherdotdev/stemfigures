import { describe, expect, it } from 'vitest'
import { RADIUS } from './particles'
import { BOX_SIDE, boxContents, keyKinds, particleSettings } from './settings'

describe('key settings in the address', () => {
  it('are left out of the address at their defaults', () => {
    expect(particleSettings.toQuery(particleSettings.defaults)).toBe('')
  })

  it('an old link without key settings opens unchanged, with the box only', () => {
    const kinds = [{ count: 3, shape: 'single', look: { size: 'm', shade: 'gray', charge: '' }, outer: { size: 's', shade: 'white', charge: '' } }]
    const old = new URLSearchParams('particles=' + JSON.stringify(kinds) + '&seed=9')
    const s = particleSettings.fromParams(old)
    expect(s.show).toBe('box')
    expect(s.keyNote).toBe('')
    expect(s.particles).toEqual(kinds)
    expect(particleSettings.toQuery(s)).toBe(old.toString())
  })

  it('travel in the address', () => {
    const d = particleSettings.defaults
    const s = { ...d, show: 'both' as const, keyNote: 'H₂O molecules are not shown', particles: [{ ...d.particles[0], name: 'Cl⁻' }, d.particles[1]] }
    expect(particleSettings.fromParams(new URLSearchParams(particleSettings.toQuery(s)))).toEqual(s)
  })

  it('clip the note to 80 characters', () => {
    expect(particleSettings.fromParams(new URLSearchParams('keyNote=' + 'x'.repeat(100))).keyNote).toHaveLength(80)
  })
})

describe('what the box holds', () => {
  const d = particleSettings.defaults

  it('scattered: the fixed square with the particle kinds', () => {
    const box = boxContents(d)
    expect(box).toMatchObject({ width: BOX_SIDE, height: BOX_SIDE, border: 'single', kinds: d.particles })
    expect(box.discs).toHaveLength(8)
  })

  it('a liquid or solid: the same fixed square, its particles arranged for the state', () => {
    for (const state of ['liquid', 'solid'] as const) {
      const box = boxContents({ ...d, state })
      expect(box).toMatchObject({ width: BOX_SIDE, height: BOX_SIDE, border: 'single', kinds: d.particles })
      expect(box.discs).toHaveLength(8)
      expect(box.discs).not.toEqual(boxContents(d).discs)
    }
  })

  it('a state travels in the address, and an address without one is a gas', () => {
    const s = { ...d, state: 'liquid' as const }
    expect(particleSettings.toQuery(s)).toBe('state=liquid')
    expect(particleSettings.fromParams(new URLSearchParams('state=liquid'))).toEqual(s)
    expect(particleSettings.fromParams(new URLSearchParams('seed=4')).state).toBe('gas')
  })

  it('a lattice: a box that just fits the grid, with no border unless one is added', () => {
    const s = { ...d, layout: 'lattice' as const, pattern: 'pure' as const, rows: 2, columns: 3 }
    const box = boxContents(s)
    const r = RADIUS[s.main.size]
    expect(box).toMatchObject({ width: 6 * r, height: 4 * r, border: 'none' })
    expect(box.discs).toHaveLength(6)
    const bordered = boxContents({ ...s, latticeBorder: 'single' })
    expect(bordered.width).toBeGreaterThan(box.width)
    expect(bordered.discs[0].x).toBeGreaterThan(box.discs[0].x)
  })

  it('a lattice keeps the scattered particles for when the teacher switches back', () => {
    const s = particleSettings.fromParams(new URLSearchParams(particleSettings.toQuery({ ...d, layout: 'lattice' })))
    expect(s.particles).toEqual(d.particles)
  })

  it('a lattice’s key lists its one or two atoms or ions, with their names', () => {
    const lattice = { ...d, layout: 'lattice' as const, mainName: 'Cl⁻ ion', secondName: 'Na⁺ ion' }
    expect(boxContents({ ...lattice, pattern: 'pure' }).kinds.map((k) => [k.look, k.name])).toEqual([[d.main, 'Cl⁻ ion']])
    expect(boxContents({ ...lattice, pattern: 'alternate' }).kinds.map((k) => [k.look, k.name])).toEqual([
      [d.main, 'Cl⁻ ion'],
      [d.second, 'Na⁺ ion'],
    ])
  })

  it('leaves the second kind out of the key when none of it is drawn', () => {
    const lattice = { ...d, layout: 'lattice' as const }
    expect(boxContents({ ...lattice, pattern: 'substitute', secondCount: 0 }).kinds).toHaveLength(1)
    expect(boxContents({ ...lattice, pattern: 'interstitial', rows: 1, secondCount: 3 }).kinds).toHaveLength(1)
    expect(boxContents({ ...lattice, pattern: 'alternate', rows: 1, columns: 1 }).kinds).toHaveLength(1)
    expect(boxContents({ ...lattice, pattern: 'substitute', secondCount: 2 }).kinds).toHaveLength(2)
  })

  it('counts second atoms beyond the lattice’s room', () => {
    const s = { ...d, layout: 'lattice' as const, pattern: 'interstitial' as const, rows: 2, columns: 2, secondCount: 3 }
    expect(boxContents(s).missing).toBe(2)
  })
})

describe('lattice settings in the address', () => {
  it('round rows and columns to whole numbers from 1 to 12', () => {
    const s = particleSettings.fromParams(new URLSearchParams('rows=3.6&columns=40'))
    expect([s.rows, s.columns]).toEqual([4, 12])
  })

  it('tidy the two looks like any other', () => {
    const main = JSON.stringify({ size: 'xl', shade: 'dark', charge: '2+' })
    const s = particleSettings.fromParams(new URLSearchParams(`main=${encodeURIComponent(main)}&second=nonsense`))
    expect(s.main).toEqual({ size: 'xl', shade: 'dark', charge: '2+' })
    expect(s.second).toEqual(particleSettings.defaults.second)
  })

  it('fill what a look leaves out from that look’s own default', () => {
    const s = particleSettings.fromParams(new URLSearchParams(`main=${encodeURIComponent('{"shade":"black"}')}`))
    expect(s.main).toEqual({ ...particleSettings.defaults.main, shade: 'black' })
  })
})

describe('a key that lists each atom', () => {
  const d = particleSettings.defaults
  const gray = { size: 'l', shade: 'gray', charge: '' } as const
  const white = { size: 's', shade: 'white', charge: '' } as const
  const water = { count: 5, shape: 'bent', look: gray, outer: white, name: 'H₂O molecule' } as const
  const s = { ...d, particles: [water], keyList: 'atoms' as const, atomNames: [{ look: white, name: 'H atom' }] }

  it('lists the atoms instead of the kinds, with their own names', () => {
    expect(keyKinds(s, boxContents(s)).map((k) => [k.look, k.name])).toEqual([
      [gray, undefined],
      [white, 'H atom'],
    ])
    expect(keyKinds({ ...s, keyList: 'particles' }, boxContents(s)).map((k) => k.name)).toEqual(['H₂O molecule'])
  })

  it('leaves the box as it is', () => {
    expect(boxContents(s)).toEqual(boxContents({ ...s, keyList: 'particles' }))
  })

  it('doesn’t change a lattice’s key, which lists its atoms already', () => {
    const lattice = { ...s, layout: 'lattice' as const }
    expect(keyKinds(lattice, boxContents(lattice))).toEqual(boxContents(lattice).kinds)
  })

  it('travels in the address', () => {
    expect(particleSettings.fromParams(new URLSearchParams(particleSettings.toQuery(s)))).toEqual(s)
  })
})
