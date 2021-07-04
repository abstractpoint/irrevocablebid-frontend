import * as d3 from 'd3'
import {
  AuctionVisualizerConfig,
  AuctionVisualizerToolTipSelection,
  AuctionVisualizerTooltipFocus,
} from '../types'

function toolTip(
  target: AuctionVisualizerToolTipSelection,
  config: React.MutableRefObject<AuctionVisualizerConfig>
) {
  if (!target) {
    return null
  }

  // Creates tooltip body if not exist
  target.style('position', 'relative')

  // Creates tooltip body if not exist
  const tooltipBody = target
    .selectAll('[data-name="tooltip"]')
    .data([0])
    .join((enter) => {
      return enter
        .append('div')
        .style('display', 'none')
        .attr('data-name', 'tooltip')
    })

  return function (selection: AuctionVisualizerToolTipSelection | null) {
    if (!selection) {
      target.on('.tooltip', null)
      return
    }

    target.on('mousemove.tooltip', moveHandler)
    target.on('mouseout.tooltip', () => toggle(null))

    function moveHandler(this: any, event: Event, d: any) {
      const coord = d3.pointer(event)
      const targetRect =
        target?.node()?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0)

      const focus = selection?.nodes().reduce(
        (acc: any, element, index: number) => {
          const rect = (element as HTMLElement).getBoundingClientRect()
          const point = new DOMPoint(
            rect.x + rect.width / 2 - targetRect.x,
            rect.y + rect.height / 2 - targetRect.y
          )
          const distance = Math.sqrt(
            (coord[0] - point.x) ** 2 + (coord[1] - point.y) ** 2
          )
          return distance < acc.distance ? { distance, element, point, index } : acc
        },
        { distance: Infinity, element: null, point: null, index: -1 }
      )

      toggle(focus)
    }

    function toggle(focus: AuctionVisualizerTooltipFocus | null) {

      if (focus && focus.distance < 15) {
        tooltipBody.style('display', 'block')
        updateContent(d3.select(focus.element).datum(), focus.index)
        setPosition(focus.point)
      } else {
        tooltipBody.style('display', 'none')
      }
    }

    function updateContent(d: any, index: number) {
      tooltipBody
        .style('display', 'block')
        .raise()
        .selectAll('tr')
        .data(config.current.tooltip.generator(d, index))
        .join('tr')
        .style(
          'color',
          (d, i) =>
            config.current.tooltip.colorScheme[
              i % config.current.tooltip.colorScheme.length
            ]
        )
        .selectAll('td')
        .data((d) => d)
        .join('td')
        .text((d) => String(d))
    }

    function setPosition(point: DOMPoint) {
      tooltipBody
        .datum(getCoords(point, config.current.tooltip.offset))
        .style('left', (d) => `${d[0]}px`)
        .style('top', (d) => `${d[1]}px`)
    }

    function getCoords(point: DOMPoint, offset: [number, number]) {
      const bodyRect =
        (tooltipBody.node() as HTMLElement)?.getBoundingClientRect() ||
        new DOMRect()
      const targetRect =
        target?.node()?.getBoundingClientRect() || new DOMRect()

      return [
        point.x + bodyRect.width + offset[0] > targetRect.width
          ? targetRect.width - bodyRect.width
          : point.x + offset[0],
        point.y + bodyRect.height + offset[1] > targetRect.height
          ? targetRect.height - bodyRect.height
          : point.y + offset[1],
      ]
    }
  }
}

export default toolTip
