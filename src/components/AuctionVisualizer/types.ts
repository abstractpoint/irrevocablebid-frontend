type AuctionVisualizerBid = {time: Date, price: number, by: string}

type AuctionVisualizerFeed = {
  prices: AuctionVisualizerBid[] /* Array of (timestamp, price) pairs */
  done: boolean /* Auction is done */
}

type AuctionVisualizerProps = {
  priceFeed: AuctionVisualizerFeed
  guarantorSellerSplitPercent: number /* e.g. 0.25 -> 25% to guarantor, 75% to seller */
  initialPrice: number /* e.g. $250 */
  guaranteedPrice: number /* e.g. $1000 */
  auctionLength: number /* in milliseconds */
}

type Margin = {
  top: number
  right: number
  bottom: number
  left: number
}

type Size = [number, number]

type AuctionVisualizerConfig = {
  margin: Margin
  size: Size
  curveType: d3.CurveFactory
  currencyFormat: string
  endingDuration: number
  endingEase: (normalizedTime: number) => number
  tooltip: {
    generator: (d: any, index: number) => [string, string | number][],
    offset: [number, number]
    colorScheme: readonly string[]
  }
  lineExtend: number // How far the line will extend beyond the canvas from the statistics side
  marker: {
    radius: number
  }
  endMarker: {
    width: number
    height: number
    transform: string
  }
}

type AuctionVisualizerToolTipSelection = d3.Selection<
  HTMLDivElement | null,
  any,
  null,
  undefined
>
type AuctionVisualizerTooltip = (
  target: AuctionVisualizerToolTipSelection,
  config: React.MutableRefObject<AuctionVisualizerConfig>
) => any
type AuctionVisualizerTooltipFocus = {
  distance: number
  element: HTMLElement
  point: DOMPoint,
  index: number
}

export type {
  AuctionVisualizerFeed,
  AuctionVisualizerProps,
  AuctionVisualizerConfig,
  AuctionVisualizerBid,
  AuctionVisualizerTooltip,
  AuctionVisualizerToolTipSelection,
  AuctionVisualizerTooltipFocus,
}
