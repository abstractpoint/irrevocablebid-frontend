import * as d3 from 'd3'

type PathPointAtLength = {
  length: number
  y: number
}

const pathX = (path: SVGPathElement | null, y: number): number => {
  if (path === null || path.getTotalLength() === 0) {
    return 0
  }

  const array = d3
    .range(path.getTotalLength())
    .map((length) => ({ length, y: path.getPointAtLength(length).y }))
    .sort((a, b) => a.y - b.y)
  const len = d3.bisector((d: PathPointAtLength) => d.y).left

  return path.getPointAtLength(array[len(array, y)].length).x
}

export { pathX }
