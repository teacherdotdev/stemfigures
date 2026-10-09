// Every generator on the site. Their names, addresses and search words are
// in the STEM Figures catalog ($shared/catalog), with every other site's;
// here each gets the component drawing its directory preview. Page titles,
// the sitemap and the top bar read GENERATORS.

import type { Component } from 'svelte'
import { generatorsOn } from '$shared/catalog/index.js'
import { SITE_ID } from '$lib/site/config.js'
import BoxPlotPreview from './box-plot/Preview.svelte'
import ConePreview from './cone/Preview.svelte'
import CoordinateGridPreview from './coordinate-grid/Preview.svelte'
import CylinderPreview from './cylinder/Preview.svelte'
import KitePreview from './kite/Preview.svelte'
import NumberLinePreview from './number-line/Preview.svelte'
import ParallelLinesPreview from './parallel-lines/Preview.svelte'
import ParallelogramPreview from './parallelogram/Preview.svelte'
import PrismPreview from './prism/Preview.svelte'
import PyramidPreview from './pyramid/Preview.svelte'
import RectanglePreview from './rectangle/Preview.svelte'
import RegularPolygonPreview from './regular-polygon/Preview.svelte'
import SpherePreview from './sphere/Preview.svelte'
import TrapezoidPreview from './trapezoid/Preview.svelte'
import TrianglePreview from './triangle/Preview.svelte'

/** Each generator's directory preview, by id. */
export const PREVIEWS: Record<string, Component> = {
  'coordinate-grid': CoordinateGridPreview,
  'number-line': NumberLinePreview,
  'triangle': TrianglePreview,
  'rectangle': RectanglePreview,
  'parallelogram': ParallelogramPreview,
  'trapezoid': TrapezoidPreview,
  'kite': KitePreview,
  'regular-polygon': RegularPolygonPreview,
  'parallel-lines': ParallelLinesPreview,
  'prism': PrismPreview,
  'cylinder': CylinderPreview,
  'pyramid': PyramidPreview,
  'cone': ConePreview,
  'sphere': SpherePreview,
  'box-plot': BoxPlotPreview,
}

export const GENERATORS = generatorsOn(SITE_ID, PREVIEWS)

export type Generator = (typeof GENERATORS)[number]

export const findGenerator = (path: string) => GENERATORS.find((g) => g.path === path)
