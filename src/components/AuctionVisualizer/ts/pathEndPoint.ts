const pathEndPoint = (path: SVGPathElement | null): DOMPoint => {
  return path
    ? path.getPointAtLength(path.getTotalLength())
    : new DOMPoint(0, 0)
}

export { pathEndPoint }
