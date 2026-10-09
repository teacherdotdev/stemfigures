# Math Figures

Math Figures (mathfigures.com) is a directory of generators that make clean,
printable math figures for teachers to paste into tests, worksheets and
slides. It is a teacher.dev project.

## Language

### The directory

**Figure**:
A finished math picture a teacher puts in front of students, such as a coordinate grid or a number line.
_Avoid_: Graphic, image, visual, resource

**Generator**:
A page that makes one kind of figure from a teacher's settings, named "<Figure> Generator".
_Avoid_: Maker, tool, builder, app

**Directory**:
The home page, which lists every generator with a live preview of its figure.
_Avoid_: Catalog, gallery, index

**Label size**:
How big a figure's text is compared to its lines: small, medium or large, one setting on every generator, set beside the export buttons. Medium is how figures have always looked; large keeps labels readable once a figure is shrunk to fit a worksheet.
_Avoid_: Font size, text size, zoom, scale

**Generator request**:
A teacher asking for a kind of figure that no generator makes yet.
_Avoid_: Feature request, suggestion

### Coordinate grids

**Coordinate Grid**:
A figure of square blocks with an x-axis and a y-axis, for plotting points and lines. Its generator is the Coordinate Grid Generator.
_Avoid_: Graph, graph paper, coordinate plane (fine as search words, not as the name)

**Chart title**:
The title across the top of a figure.
_Avoid_: Title (alone), heading

**Axis title**:
Text that runs along an axis to say what it measures, such as "Time (hours)". It can be written text or a blank line for students.
_Avoid_: Axis label, axis name

**Axis label**:
The short name at an axis's arrow tip, such as x or y.
_Avoid_: Axis title, variable

**End cap**:
How one end of an axis finishes: a triangle arrow, a line arrow, a circle or nothing.
_Avoid_: Arrow (alone), arrowhead, tip

**Preset**:
A named set of settings for one generator, saved by the teacher in their browser. None are built in.
_Avoid_: Template, favorite

**Range**:
The stretch of numbers an axis covers, set as From, To and Step (such as −2 to 5 by 1). Both the Coordinate Grid and the Number Line use it.
_Avoid_: Domain, interval, window, start and blocks

**Numbering**:
How the numbers under the ticks are written: decimals, fractions, multiples of π or degrees. It isn't a setting; it follows how the teacher typed the range, so a range typed with π is numbered in π and one typed with ° is numbered in degrees.
_Avoid_: Format, label style

**Minor gridline**:
A thin, faint, unnumbered line that splits each block of a coordinate grid into 2, 4 or 5 parts. A grid has none unless the teacher picks a number.
_Avoid_: Subdivision, fine grid, minor tick

**Angle unit**:
Whether a coordinate grid's trig functions read x in radians or degrees. It's one setting for the whole figure, set with the x-axis: radians, until the teacher types ° in the x-axis range (which switches it to degrees) or picks degrees.
_Avoid_: Angle mode, trig mode

### Number lines

**Number Line**:
A figure of one horizontal axis with evenly spaced ticks, for placing numbers and graphing equations and inequalities in one variable. Its generator is the Number Line Generator.
_Avoid_: Line graph, ruler

**Equation**:
What the teacher types to graph, one per row. On a number line it's an inequality or equation in one letter, such as −2 < x ≤ 5, x < −1 or x ≥ 3, or x = 2, or a list of points, each one number, such as 3 or −1, 2.5, π/2, or a sequence; every row is drawn over the same line, and a number line with no equation is blank. On a coordinate grid it's a line or curve that can be written as y = …, such as y = 2x + 1, 2x + 3y = 6, x = 4 or y = x² − 4, or a list of points, such as (1, 2), (3, 4). Points aren't equations, but they're typed in the same rows and called the same thing. (Both generators' rows are `eq` in the page address; the number line's reading code still calls an equation `inequality`, and older number line links with `inequality=` still open.)
_Avoid_: Solution set, interval, expression

**Tick**:
A short mark across a number line at every step of its range. Numbered ticks are drawn longer than the ticks between them.
_Avoid_: Notch, hash mark, gridline

**Equation graph**:
The thick line, arrows and endpoints drawn over a number line to show which numbers make its equation true. Where it runs off an end it has its own arrow, just inside the number line's arrow.
_Avoid_: Shading, solution, plot

**Graphed line**:
A straight line or curve drawn across a coordinate grid from an equation, with an arrowhead where it leaves the grid. A curve is anything that can be solved for y, such as a parabola or 2^x; sideways curves, circles and shaded inequalities aren't drawn yet.
_Avoid_: Plot, function, curve

**Row style**:
How one equation is drawn, set from the button before it, which shows a miniature of how the row is drawn: a color, a line style (solid, dashed or dotted) and which ends have arrows (both, neither, left or right; for an up-and-down line, left means the bottom), whether endpoints show, and whether asymptotes show. Points take the color and a point mark: a dot, or a cross as French classrooms use. On a number line a row's style is its color, whether values are written, and for points and sequences a point mark and how point labels show; a number line's thick line, arrows and circles carry meaning, so they can't be changed. Every row starts black. Values are written above the line for endpoints and unlabeled points that don't sit on a numbered tick, the way their own row was typed (0.35 as 0.35, 3/8 as a fraction), unless the row style turns them off (for an estimate-this-point question). The color goes on the row's thick line, arrows, circles and points, never on the line, ticks or numbers. Rows of the same color join into one equation graph, as they always have; rows of different colors are drawn separately, each color over the colors that came before it in the list.
_Avoid_: Format, appearance, theme

**Point mark**:
How points are drawn: a dot or a cross. It's part of each points row's row style, on both the coordinate grid and the number line. It never changes an endpoint, whose open or closed circle has a meaning.
_Avoid_: Marker, symbol, dot style

**Sequence**:
A number line row typed as a rule in n, such as aₙ = 1/n, uₙ = 1/n or just 1/n, shown for n from one whole number to another (1 to 5 unless the teacher changes it). Its terms are drawn as points, so 1/n from 1 to 5 marks 1, 1/2, 1/3, 1/4 and 1/5. Terms past the end of the line are left off with a note, not treated as a mistake. Rules built from earlier terms, such as aₙ = aₙ₋₁ + 3, aren't read yet.
_Avoid_: Series, pattern, list

**Term**:
One number a sequence makes, drawn as a point on the line.
_Avoid_: Element, value

**Endpoint**:
Where an equation's graph or a graphed line stops at a number, drawn as an open circle (not included) or a closed circle (included). On a coordinate grid, a graphed line's endpoints are at the ends of its domain, and a row style can hide them so the line simply stops.
_Avoid_: Dot, point, boundary

**Domain**:
The stretch of x-values a graphed line is drawn over (y-values, for an up-and-down line), typed after its equation as an inequality, such as y = 3x, −5 ≤ x < 7. Using ≤ or < picks a closed or open endpoint. A piecewise function is several rows, each with its own domain. A graphed line with no domain runs across the whole grid. An end cut off by its domain inside the grid never has an arrowhead; an end whose domain runs past the grid's edge follows the row style's arrows.
_Avoid_: Restriction, bounds, interval, range (an axis's range is different)

**Hole**:
A single x-value where a graphed line is undefined but the curve continues on both sides, such as x = 1 in y = (x² − 1)/(x − 1). It's found automatically and drawn as an open circle.
_Avoid_: Gap, removable discontinuity (fine in teaching, not as the name), missing point

**Asymptote**:
A line that a graphed line approaches but never reaches: vertical, horizontal or slant. Where a graphed line meets a vertical asymptote, the curve breaks and each side runs to the grid's edge with an arrowhead. Asymptotes are found for the whole row and, when its row style shows them, drawn as dotted lines in the row's color, without their equations; they're hidden unless the teacher shows them.
_Avoid_: Discontinuity, break, limit line

**Point label**:
The letter written at a point, typed before it in textbook notation: A(1, 2) on a coordinate grid, P(0.35) on a number line. It's one letter, with primes or a subscript allowed (A′, A₁), and it belongs to its point, so it stays when the point's numbers change and goes when the point is deleted. A points row's style shows just the labels or the labels with their coordinates or values, A or A(0.35). On a number line a labeled point's value is never written, since it would give the answer away; endpoints and sequence terms aren't labeled.
_Avoid_: Point name, vertex name (that's a triangle's), letter, tag

### Shapes

**Shape**:
A figure of straight sides meeting at named vertices, drawn to scale from its measures and labeled for students: a triangle, a quadrilateral or a regular polygon. Each has its own generator.
_Avoid_: Polygon (alone; say regular polygon for that figure), diagram, drawing

**Part**:
Any vertex, side, angle or extra line of a shape, or any of a box plot's five-number summary: something that can carry a label or a marking.
_Avoid_: Element, component, piece

**Vertex name**:
The letter at a corner, such as A, B or C. Each can be renamed or left blank, and the shape's measures are named after them (∠B, AB).
_Avoid_: Point, corner label

**Measure**:
A side's length or an angle's size, in degrees. A **given** measure is one the teacher types; a **solved** measure is worked out from the givens. Drawing to scale means proportional, not true size on paper.
_Avoid_: Value, dimension, size

**Part label**:
What's written at a part: nothing, its measure (such as 12 or 24°, with the figure's unit on lengths, or a box plot's Q1 value), or text the teacher types, such as x or 2y + 1. It replaces the text boxes teachers otherwise lay over a drawing.
_Avoid_: Text box, caption, annotation, label (alone; axes have their own labels)

**Unit**:
One optional unit for the whole shape, such as cm or ft, added to every length shown as its measure.
_Avoid_: Scale

**Extra line**:
A line drawn onto a shape that isn't one of its sides: a height, dropped from a vertex to a side, which is extended when the height lands outside the shape, a quadrilateral's diagonal, joining opposite vertices, or a regular polygon's apothem or radius. The point where a height lands, or where the diagonals cross, can be given a name, such as E. It can be solid, dashed or dotted, like a graphed line.
_Avoid_: Auxiliary line, segment, construction

**Marking**:
A standard geometry symbol on a part: congruence ticks on sides, parallel arrows on sides, congruence arcs on angles, or a right-angle square. The teacher sets congruence marks and parallel arrows by hand, never from the measures or the kind of shape, so they don't give answers away. An angle gets an arc only when it has a label or congruence arcs. A right-angle square appears on its own at every 90° angle, including where a height meets a side and where diagonals cross at right angles, and can be turned off.
_Avoid_: Symbol, annotation, tick (a number line's tick is different)

**Parallel arrows**:
One, two or three arrowheads in the middle of a side; sides with the same number are parallel.
_Avoid_: Parallel marks, chevrons

**Base side**:
The side that sits flat along the bottom before any flip or rotation.
_Avoid_: Bottom, base (alone; a height's base is the side it meets)

### Triangles

**Triangle**:
A shape with three vertices, drawn from any three measures that make one. Its generator is the Triangle Generator.
_Avoid_: Shape (alone), polygon

**Other triangle**:
The second triangle two sides and a non-included angle can make (the ambiguous case). The generator draws the one whose unknown angle is acute unless the teacher switches to the other.
_Avoid_: Second solution, alternate

### Quadrilaterals

**Quadrilateral**:
A shape with four vertices, A, B, C and D in order around it. Each family of quadrilaterals has its own generator: the Rectangle, Parallelogram, Trapezoid and Kite Generators.
_Avoid_: Quad, four-sided polygon

**Kind**:
Which quadrilateral a generator draws, which decides the measures the teacher gives. The Rectangle Generator draws rectangles and squares, the Parallelogram Generator parallelograms and rhombi, the Trapezoid Generator trapezoids, isosceles trapezoids and right trapezoids, and the Kite Generator kites.
_Avoid_: Type, shape (alone), category

**Trapezoid**:
A quadrilateral with exactly one pair of parallel sides, its **bases**; the other two are its **legs**. A right trapezoid has a leg at right angles to both bases.
_Avoid_: Trapezium (what UK teachers call it; fine as a search word)

### Regular polygons

**Regular polygon**:
A shape with 3 to 20 equal sides and equal angles around a center, sized by its side, radius or apothem. Its generator is the Regular Polygon Generator. Past 12 sides it's named by its count, such as a 15-gon.
_Avoid_: Polygon (alone), n-sided shape

**Center**:
The point a regular polygon is drawn around, the same distance from every vertex. It can be shown as a dot and named, such as O.
_Avoid_: Centre, midpoint, origin

**Apothem**:
The line from a regular polygon's center to the middle of a side, at right angles to it, and its length. The generator draws it to the bottom side.
_Avoid_: Inradius, height

**Radius**:
The line from a regular polygon's center to a vertex, and its length; together, the **radii**. The generator draws one to the bottom right vertex, so with the apothem it makes the right triangle used for area.
_Avoid_: Circumradius

### Parallel lines and transversals

**Parallel Lines and Transversal**:
A figure of two lines cut by one or two transversals, with the angles where they cross numbered, measured or labeled for students. The two lines are parallel unless the teacher gives the second a tilt. Its generator is the Parallel Lines and Transversal Generator. It isn't a **Shape**: its lines run on past the figure, with no corners.
_Avoid_: Transversal diagram, angle pairs diagram (fine as search words)

**Transversal**:
A line that crosses both lines, each at its own point. A figure has one, named t, and can have a second, named s. Two transversals never cross a line at the same point.
_Avoid_: Cutting line, secant

**Crossing**:
Where a transversal meets one of the lines, making four angles around it. It can be shown as a point and named.
_Avoid_: Intersection (fine in teaching), vertex, corner

**Angle number**:
The number that names an angle by where it sits: 1 to 4 around the first transversal's crossing with the first line, top left, top right, bottom left, bottom right, then 5 to 8 the same way at its crossing with the second line; 9 to 16 for a second transversal. An angle's number is its label until the teacher changes it, so it can be retyped as x or 3x + 5 or swapped for the angle's measure; the number still names the angle in the settings panel.
_Avoid_: Angle name, angle label (its label can be something else)

**Tilt**:
How far the second line turns from the first, in degrees, when the lines aren't parallel.
_Avoid_: Lean (that's an oblique 3D shape's slide), slope, skew

**Shading**:
A light color filling one angle near its crossing, so the teacher can point at an angle pair ("what is the relationship between the shaded angles?"). It's set per angle and never follows from the measures.
_Avoid_: Highlight, fill, color (alone)

### Data displays

**Data set**:
The numbers a teacher types in one row to be displayed, such as 12, 15, 15, 18, 22, 30, with an optional name like "Class A". Several rows are drawn over the same axis to compare them.
_Avoid_: Data, list, values, series

**Box Plot**:
A figure of one or more data sets, each drawn as a box from Q1 to Q3 split at the median, with whiskers out to the ends, over one shared number line. Its generator is the Box Plot Generator.
_Avoid_: Box and whisker plot, box chart (fine as search words, not as the name)

**Five-number summary**:
The minimum, Q1, median, Q3 and maximum of a data set. Quartiles are the medians of the lower and upper halves, leaving out the median when the count is odd, as the TI-84 works them out. A teacher can type the five numbers instead of a data set. None is written on the figure unless the teacher gives it a part label, so the figure doesn't give answers away.
_Avoid_: Summary statistics, five statistics

**Outlier**:
A value more than 1.5 times the box's width beyond either end of the box, drawn as its own point with the whisker stopping at the last value that isn't one. Outliers are only drawn when the teacher turns them on; otherwise whiskers reach the minimum and maximum.
_Avoid_: Extreme value, anomaly

**Histogram**:
A figure of touching bars over a numbered axis, one bar per bin, whose heights show how many values fall in each bin. Its generator is the Histogram Generator.
_Avoid_: Bar graph (bars there are separate categories), column chart

**Bin**:
One stretch of the histogram's axis, such as 10 to 20, numbered at its edges. A value on an edge belongs to the bin that starts there. Bins come from a data set with a start and bin width, or are typed with their counts as a frequency table.
_Avoid_: Interval, class, bucket, range (a range is an axis's From, To and Step)

**Frequency**:
How many values fall in a bin: the height of its bar, read off the histogram's vertical axis.
_Avoid_: Count (fine in speech), tally

**Line plot**:
A number line with a mark stacked above each value of a data set, as grades 3–6 use the name. No generator makes one yet.
_Avoid_: Dot plot is the same figure; line graph (points joined across a coordinate grid) is a different one

### 3D shapes

**3D Shape**:
Any of the three-dimensional figures below — a prism, cylinder, pyramid, cone or sphere — drawn to scale from the measures the teacher gives and labeled for students. Each has its own generator; the words in this section belong to all of them. A 3D shape isn’t a **Shape**, which is flat.
_Avoid_: Solid (fine as a search word), 3D figure, volume diagram, shape (alone)

**Prism**:
A 3D shape with two matching bases joined by flat sides: a rectangle (a box), a right or isosceles triangle, or a regular polygon of 3 to 8 sides. It stands on its base or lies on its side; a triangular prism lies down unless the teacher stands it up. Its generator is the Prism Generator.
_Avoid_: Box (fine as a search word), cuboid

**Cylinder**:
A 3D shape with two matching circles joined by a curved side. Its generator is the Cylinder Generator.
_Avoid_: Can, tube

**Pyramid**:
A 3D shape with a base, a rectangle or a regular polygon, whose sides meet at a tip. Its generator is the Pyramid Generator.
_Avoid_: Tetrahedron (fine as a search word)

**Cone**:
A 3D shape with a circle for its base and a curved side that meets at a tip. Its generator is the Cone Generator.

**Sphere**:
A 3D shape that is round all over, every point on it the same distance from its middle. Its generator, the Sphere Generator, also draws a **hemisphere**: half a sphere, its flat face down like a dome or up like a bowl.
_Avoid_: Ball, half sphere

**Oblique**:
A 3D shape that leans: its top slides sideways from above its base, so its side edges slant and its height is shorter than them. The opposite, standing straight up, is **right**, as in right prism.
_Avoid_: Slanted, tilted, leaning, skewed

**Hidden edge**:
An edge a viewer couldn't see through the front of a 3D shape, drawn dashed. Hidden edges can be turned off to leave only the outline.
_Avoid_: Back edge, dotted edge, invisible line

**Height** (of a 3D shape):
The straight-up distance from a 3D shape's base to its top or tip, drawn dashed with a right-angle square where it meets the base. On an oblique shape it lands outside the shape, so the base's line is extended out to meet it. It can be shown or hidden.
_Avoid_: Altitude, perpendicular height (fine in a label), vertical

**Slant height**:
On a right pyramid or cone, the distance from the tip down the middle of a sloping face (on a cone, down its side) to the base's edge.
_Avoid_: Slant, lateral height, side length

**Lean**:
How far an oblique shape's top slides sideways past its base, measured along the base's extended line. Any two of the height, the lean and the slanted side edge are enough; the third is worked out.
_Avoid_: Offset, shift, overhang
