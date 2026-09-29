// Heating and Cooling Curve's settings, as they appear in the page address.
// The grid and axes are $shared/graph's, the same settings as Math's
// coordinate grid.

import { gridFields } from '$shared/graph/axes'
import { COLORS, type Color } from '$shared/graph/colors'
import { bool, choice, defineSettings, number } from '$lib/shared/settings'
import { DIRECTIONS, SUBSTANCES, type Direction, type Properties, type SegmentKey, type Temperatures } from './curve'

/** What the curve is worked out from: the substance's properties, or segment lengths typed in. */
export const SOURCES = ['properties', 'lengths'] as const
/** What runs along the x-axis. */
export const X_QUANTITIES = ['time', 'heat'] as const
export type XQuantity = (typeof X_QUANTITIES)[number]
/** What each segment is labeled with: its state, a blank line for students, or nothing. */
export const SEGMENT_LABELS = ['states', 'blank', 'none'] as const
export const SEGMENT_LABEL_NAMES: Record<(typeof SEGMENT_LABELS)[number], string> = { states: 'States', blank: 'Blank lines', none: 'None' }
/** What a plateau is labeled with: both states ("Solid + liquid"), or the change ("Melting"). */
export const PLATEAU_LABELS = ['states', 'change'] as const

/** The x-axis title this page writes for each direction and quantity. */
export const xTitleFor = (dir: Direction, q: XQuantity) => (q === 'time' ? 'Time (min)' : dir === 'heating' ? 'Heat added (kJ)' : 'Heat removed (kJ)')
export const PAGE_X_TITLES = ['Time (min)', 'Heat added (kJ)', 'Heat removed (kJ)']

const WATER = SUBSTANCES[0]
const temperature = (fallback: number) => number({ min: -273.15, max: 5000, fallback })
const positive = (fallback: number, max: number) => number({ min: 0.001, max, fallback })
const length = (fallback: number) => number({ min: 0, max: 100000, fallback })

export const curveSettings = defineSettings({
  direction: choice(DIRECTIONS, 'heating'),
  source: choice(SOURCES, 'lengths'),
  xQuantity: choice(X_QUANTITIES, 'time'),
  startT: temperature(-20),
  endT: temperature(120),
  mp: temperature(WATER.mp),
  bp: temperature(WATER.bp),
  // From properties: the sample, how fast it's heated, and the substance.
  mass: positive(100, 100000),
  rate: positive(10, 100000),
  cSolid: positive(WATER.properties.cSolid, 100),
  cLiquid: positive(WATER.properties.cLiquid, 100),
  cGas: positive(WATER.properties.cGas, 100),
  fusH: positive(WATER.properties.fusH, 1000),
  vapH: positive(WATER.properties.vapH, 1000),
  molarMass: positive(WATER.properties.molarMass, 2000),
  // From lengths: how long each segment is along the x-axis, whichever the curve has.
  solidW: length(2),
  meltW: length(3),
  liquidW: length(5),
  boilW: length(8),
  gasW: length(2),
  supercool: bool(false),
  supercoolBy: number({ min: 0.1, max: 1000, fallback: 5 }),
  letters: bool(false),
  segmentLabels: choice(SEGMENT_LABELS, 'states'),
  plateauLabels: choice(PLATEAU_LABELS, 'states'),
  guides: bool(true),
  color: choice(Object.keys(COLORS) as Color[], 'red'),
  ...gridFields({
    xFrom: '0', xTo: '20', xStep: '1', xEvery: 2,
    yFrom: '-20', yTo: '120', yStep: '10', yEvery: 2,
    title: '', titleMode: 'none',
    xTitle: 'Time (min)', xTitleMode: 'text',
    yTitle: 'Temperature (°C)', yTitleMode: 'text',
    xLabel: 'x', xLabelMode: 'none', yLabel: 'y', yLabelMode: 'none',
    xStartCap: 'none', xEndCap: 'none', yStartCap: 'none', yEndCap: 'none',
    minor: 0,
  }),
})

export type CurveSettings = typeof curveSettings.defaults

/** The settings key holding each segment's typed length. */
export const WIDTH_KEYS = { solid: 'solidW', melt: 'meltW', liquid: 'liquidW', boil: 'boilW', gas: 'gasW' } as const satisfies Record<SegmentKey, keyof CurveSettings>

export const temperaturesOf = (s: CurveSettings): Temperatures => ({ startT: s.startT, endT: s.endT, mp: s.mp, bp: s.bp })

export const propertiesOf = (s: CurveSettings): Properties => ({
  cSolid: s.cSolid,
  cLiquid: s.cLiquid,
  cGas: s.cGas,
  fusH: s.fusH,
  vapH: s.vapH,
  molarMass: s.molarMass,
})
