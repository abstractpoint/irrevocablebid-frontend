import * as React from 'react';
import { AuctionVisualizerProps, AuctionVisualizerBid } from './types';
import defaultConfig from './defaultConfig';
import { ElementId } from './ts/ElementId';
// import curveMarker from '../../assets/oie_trans.gif';
import toolTip from './ts/tooltip';
import * as d3 from 'd3';
import './style.css';
import './tooltip.css';
// todo: fix gif import
let curveMarker = '';

const AuctionVisualizer = (props: AuctionVisualizerProps) => {
  // Global fixed data
  const nameRef = React.useRef('auction-visualizer');
  const configRef = React.useRef(defaultConfig);
  const tooltipRef = React.useRef<any>(null);

  // Top level elements
  const svgRef = React.useRef(null);
  const curveRef = React.useRef<SVGPathElement>(null);
  const referenceCurveRef = React.useRef<SVGPathElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Creates unique elements id's for each instance of this component
  const curveIdRef = React.useRef(ElementId(nameRef.current));
  const pathAboveClipIdRef = React.useRef(ElementId(nameRef.current));
  const floorClipIdRef = React.useRef(ElementId(nameRef.current));

  React.useEffect(() => {
    // Creates the tooltip generator
    tooltipRef.current = toolTip(d3.select(wrapperRef.current), configRef);

    // Useful constants
    const firstBid: AuctionVisualizerBid = props.priceFeed.prices.length
      ? props.priceFeed.prices[0]
      : { time: new Date(), price: 0, by: '' };
    const lastBid: AuctionVisualizerBid = props.priceFeed.prices.length
      ? props.priceFeed.prices[props.priceFeed.prices.length - 1]
      : { time: new Date(), price: 0, by: '' };
    const lastPrice = lastBid.price;
    const maxPrice = Math.max(props.guaranteedPrice * 1.3, lastPrice);
    const floorY =
      configRef.current.margin.top +
      (configRef.current.size[1] -
        configRef.current.margin.top -
        configRef.current.margin.bottom) *
        ((maxPrice - props.guaranteedPrice) / maxPrice);
    const timeRange = firstBid
      ? [firstBid.time, firstBid.time.valueOf() + props.auctionLength]
      : [Date.now(), Date.now() + props.auctionLength];
    const curveArea: {
      x: number;
      y: number;
      width: number;
      height: number;
    } = {
      x: configRef.current.margin.left,
      y: configRef.current.margin.top,
      width:
        configRef.current.size[0] -
        configRef.current.margin.left -
        configRef.current.margin.right,
      height:
        configRef.current.size[1] -
        configRef.current.margin.top -
        configRef.current.margin.bottom,
    };

    // Creates d3 string formatters
    const currencyFormat = d3.format(configRef.current.currencyFormat);
    const percentFormat = d3.format('.0%');

    // Creates scales for use in the line generator
    const xScale = d3
      .scaleTime()
      .domain(timeRange)
      .range([
        configRef.current.margin.left,
        configRef.current.size[0] - configRef.current.margin.right,
      ]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxPrice])
      .range([
        configRef.current.size[1] - configRef.current.margin.bottom,
        configRef.current.margin.top,
      ]);

    // Creates the line generator that accepts data and returns a string of SVG path
    const line = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(configRef.current.curveType); // Line smoothing algorithm

    // Create an area generator for clipping the floor bar
    const area = d3
      .area()
      .x((d) => xScale(d[0]))
      .y0((d) => yScale(d[1]))
      .y1((d) => 0)
      .curve(configRef.current.curveType);

    // The following code selects elements and assigns the desired values to their attributes.
    // The code is divided into logical blocks, within each 'call()' handled one structural branch.
    d3.select(wrapperRef.current)
      .style('width', `${configRef.current.size[0]}px`)
      .style('height', `${configRef.current.size[1]}px`);

    d3.select(svgRef.current).call((svg) => {
      const curveEndPoint = new DOMPoint(
        xScale(lastBid.time),
        yScale(lastBid.price)
      );
      const curvePathString = line(
        props.priceFeed.prices.map((v) => [v.time.valueOf(), v.price])
      );

      // Hidden reference curve
      d3.select(referenceCurveRef.current).attr('d', () => curvePathString);

      // Animated bidding curve
      d3.select(curveRef.current)
        .transition()
        .attr('d', () => curvePathString)
        .attr(
          'stroke-dasharray',
          () => `${referenceCurveRef.current?.getTotalLength()} 100%`
        );

      // Set the animated marker at the end of the curve
      svg
        .select('[data-name="curve-marker"]')
        .call((marker) => {
          marker
            .select('image')
            .attr('width', configRef.current.endMarker.width)
            .attr('height', configRef.current.endMarker.height)
            .attr('transform', configRef.current.endMarker.transform);
        })
        .transition()
        .attr(
          'transform',
          `translate(${curveEndPoint.x}, ${curveEndPoint.y}) scale(${
            lastPrice > props.guaranteedPrice ? 1 : 0
          })`
        );

      // Clip the active part of floor line according to curve
      svg
        .select(`#${floorClipIdRef.current} > path`)
        .attr('d', (d) =>
          area(props.priceFeed.prices.map((v) => [v.time.valueOf(), v.price]))
        )
        .attr('transform', `translate(0, ${-floorY})`);

      // Clip rect for the curve above floor line
      svg
        .select(`#${pathAboveClipIdRef.current} > rect`)
        .transition()
        .attr('height', floorY + 1.5); // Plus half of stroke width pixels for smoot connection with floor line

      // Creates bidding markers
      svg
        .select('[data-name="bidding-markers"]')
        .selectAll('circle')
        .data(props.priceFeed.prices.slice(1))
        .join((enter) => {
          return enter
            .append('circle')
            .attr('r', 0)
            .attr('cx', (d) => xScale(d.time))
            .attr('cy', (d) => yScale(d.price))
            .attr('data-name', (d) =>
              d.price > props.guaranteedPrice ? 'above' : 'below'
            );
        })
        .call(tooltipRef.current)
        .transition()
        .attr('cx', (d) => xScale(d.time))
        .attr('cy', (d) => yScale(d.price))
        .transition()
        .attr('r', configRef.current.marker.radius);

      // Sets the position and value of the current rate
      svg.select('[data-name="current-bid"]').call((bid) => {
        bid.transition().attr('transform', `translate(0, ${curveEndPoint.y})`);

        bid
          .select('line')
          .transition()
          .attr('x1', curveEndPoint.x)
          .attr(
            'x2',
            configRef.current.size[0] - configRef.current.margin.right
          );

        bid
          .select('text')
          .attr('x', configRef.current.size[0] - configRef.current.margin.right)
          .transition()
          .text(currencyFormat(lastBid.price));
      });

      // Sets the initial price section
      svg.select('[data-name="initial-price"]').call((initialPrice) => {
        initialPrice
          .transition()
          .attr(
            'transform',
            `translate(${configRef.current.margin.left}, ${yScale(
              props.initialPrice
            )})`
          );

        initialPrice
          .selectAll('text')
          .attr(
            'x',
            configRef.current.size[0] - configRef.current.margin.right
          );

        initialPrice
          .select('[data-name="value"]')
          .text(currencyFormat(props.initialPrice));

        initialPrice
          .select('rect')
          .attr('width', curveArea.width)
          .transition()
          .attr(
            'height',
            curveArea.height + curveArea.y - yScale(props.initialPrice)
          );

        initialPrice
          .select('line')
          .attr('x1', 0)
          .attr(
            'x2',
            configRef.current.size[0] -
              configRef.current.margin.left -
              configRef.current.margin.right
          );
      });

      // Sets floor line with label and value text
      svg.select('[data-name="floor"]').call((floor) => {
        floor.transition().attr('transform', `translate(0, ${floorY})`);

        floor
          .select('[data-name="value"]')
          .attr('x', configRef.current.size[0] - configRef.current.margin.right)
          .text(currencyFormat(props.guaranteedPrice));

        floor
          .select('line[data-name="permanent"]')
          .attr('x1', configRef.current.margin.left)
          .attr(
            'x2',
            configRef.current.size[0] - configRef.current.margin.right
          );

        floor
          .select('line[data-name="active"]')
          .attr('x1', configRef.current.margin.left)
          .transition()
          .attr('x2', xScale(lastBid ? lastBid.time.valueOf() : Date.now()));
      });

      // Final animation
      svg.call((svg) => {
        const rectWidth = 110;
        const padding = 5;

        svg.transition().call((transition) => {
          transition
            .select('[data-name="current-bid"] text')
            .attr('opacity', props.priceFeed.done ? 0 : 1);

          transition
            .select('[data-name="profit-split"] [data-name="final-price"]')
            .attr('opacity', props.priceFeed.done ? 1 : 0)
            .text(currencyFormat(Math.max(lastPrice, props.guaranteedPrice)));
        });

        svg.select('[data-name="profit-split"]').call((profitSplit) => {
          profitSplit.attr('opacity', 0);

          if (props.priceFeed.done) {
            const endedBelow = lastBid.price <= props.guaranteedPrice;
            const lastPrice = lastBid.price;
            const profitSplitHeight =
              configRef.current.size[1] -
              configRef.current.margin.bottom -
              yScale(Math.max(lastPrice, props.guaranteedPrice));
            const splitOffset =
              (Math.max(0, lastPrice - props.guaranteedPrice) *
                props.guarantorSellerSplitPercent) /
              lastPrice;

            profitSplit

              // Set start elements position
              .call((profitSplit) => {
                const profitY = endedBelow
                  ? yScale(props.guaranteedPrice)
                  : curveEndPoint.y;

                profitSplit.attr(
                  'transform',
                  `translate(${
                    configRef.current.size[0] - configRef.current.margin.right
                  }, ${profitY})`
                );

                profitSplit
                  .selectAll('line[data-orientation="h"]')
                  .attr('x1', 0)
                  .attr('y1', 0)
                  .attr('x2', configRef.current.lineExtend)
                  .attr('y2', 0);

                profitSplit
                  .selectAll('line[data-orientation="v"]')
                  .attr('x1', configRef.current.lineExtend / 2)
                  .attr('x2', configRef.current.lineExtend / 2)
                  .attr('y1', 0)
                  .attr('y2', 0);

                profitSplit.selectAll('text').attr('x', 0).attr('y', 0);

                profitSplit
                  .select('[data-name="final-price"]')
                  .attr('x', (rectWidth + configRef.current.lineExtend) / 2);

                profitSplit
                  .select('[data-name="middle"]')
                  .attr('transform', 'translate(0, 0)');

                profitSplit
                  .select('[data-name="bars"]')
                  .attr(
                    'transform',
                    `translate(${configRef.current.lineExtend / 2}, 0)`
                  )
                  .call((bars) => {
                    bars.selectAll('g').attr('transform', 'translate(0, 0)');

                    bars
                      .selectAll('rect')
                      .attr('x', padding)
                      .attr('y', 0)
                      .attr('width', rectWidth)
                      .attr('height', 0);

                    bars
                      .selectAll('[data-name="label"]')
                      .attr('x', rectWidth / 2 + padding);

                    bars
                      .selectAll('[data-name="value"]')
                      .attr('x', rectWidth + padding);

                    bars
                      .select('g[data-name="guarantor"]')
                      .select('[data-name="value"]')
                      .text(currencyFormat(splitOffset * lastPrice));

                    bars
                      .select('g[data-name="consignor"]')
                      .select('[data-name="value"]')
                      .text(
                        currencyFormat(
                          Math.max(
                            props.guaranteedPrice,
                            lastPrice * (1 - splitOffset)
                          )
                        )
                      );

                    bars
                      .select('[data-name="message"]')
                      .attr('transform', `translate(${rectWidth + padding}, 0)`)
                      .call((message) => {
                        message
                          .select('[data-name="row1"]')
                          .text(endedBelow ? 'Guarantor' : '');

                        message
                          .select('[data-name="row2"]')
                          .attr('dy', '1em')
                          .text(endedBelow ? 'Buys NFT' : '');
                      });
                  });

                profitSplit
                  .select('text[data-name="split"]')
                  .attr('x', configRef.current.lineExtend);

                profitSplit
                  .select('text[data-name="guarantor-percent"]')
                  .attr('x', configRef.current.lineExtend / 2)
                  .text(percentFormat(props.guarantorSellerSplitPercent));

                profitSplit
                  .select('text[data-name="consignor-percent"]')
                  .attr('x', configRef.current.lineExtend / 2)
                  .text(percentFormat(1 - props.guarantorSellerSplitPercent));

                // Hides the guarantor block if the last bid is below the floor
                profitSplit
                  .selectAll('g[data-name="middle"], g[data-name="guarantor"]')
                  .attr('opacity', endedBelow ? 0 : 1);
              })
              .transition()
              .duration(configRef.current.endingDuration)
              .ease(configRef.current.endingEase)
              // Animates elements to final position
              .call((transition) => {
                transition.attr('opacity', 1);

                transition
                  .select('g[data-name="middle"]')
                  .attr(
                    'transform',
                    `translate(0, ${profitSplitHeight * splitOffset})`
                  );

                transition
                  .select('line[data-name="bottom"]')
                  .attr('y1', profitSplitHeight)
                  .attr('y2', profitSplitHeight);

                transition
                  .select('line[data-name="vertical"]')
                  .attr('y2', profitSplitHeight);

                transition
                  .select('g[data-name="guarantor"]')
                  .attr('transform', `translate(0, ${padding})`)
                  .call((guarantor) => {
                    guarantor
                      .select('rect')
                      .attr(
                        'height',
                        profitSplitHeight * splitOffset - padding * 2
                      );

                    guarantor
                      .select('[data-name="label"]')
                      .attr(
                        'y',
                        (profitSplitHeight * splitOffset - padding * 2) / 2
                      );

                    guarantor
                      .select('[data-name="value"]')
                      .attr(
                        'y',
                        (profitSplitHeight * splitOffset - padding * 2) / 2
                      );
                  });

                transition
                  .select('g[data-name="consignor"]')
                  .attr(
                    'transform',
                    `translate(0, ${
                      endedBelow
                        ? padding
                        : profitSplitHeight * splitOffset + padding
                    })`
                  )
                  .call((consignor) => {
                    const totalConsignorHeight = endedBelow
                      ? profitSplitHeight - padding * 2
                      : profitSplitHeight * (1 - splitOffset) - padding * 2;

                    consignor
                      .select('rect[data-name="total"]')
                      .attr('height', totalConsignorHeight);

                    consignor
                      .select('rect[data-name="above-floor"]')
                      .attr(
                        'height',
                        ((lastPrice - props.guaranteedPrice) / lastPrice -
                          splitOffset) *
                          profitSplitHeight -
                          padding
                      );

                    consignor
                      .select('[data-name="label"]')
                      .attr('y', totalConsignorHeight / 2);

                    consignor
                      .select('[data-name="value"]')
                      .attr('y', totalConsignorHeight / 2);
                  });
              });
          }
        });
      });
    });

    // Destroys the tooltip
    return () => {
      tooltipRef.current(null);
    };
  });

  return (
    <div className="auction-visualizer" ref={wrapperRef}>
      <svg ref={svgRef}>
        <defs>
          <clipPath id={pathAboveClipIdRef.current}>
            <rect x="0" y="0" width="100%" />
          </clipPath>
          <clipPath id={floorClipIdRef.current}>
            <path />
          </clipPath>
          <path ref={referenceCurveRef} />
          <path ref={curveRef} id={curveIdRef.current} />
        </defs>

        <g data-name="floor">
          <text data-name="label">Floor</text>
          <text data-name="value" />
          <line data-name="permanent" />
          <line
            data-name="active"
            clipPath={`url(#${floorClipIdRef.current})`}
          />
        </g>

        <g data-name="current-bid">
          <line />
          <text data-name="current-price"></text>
        </g>

        <g>
          <use data-name="path--below-floor" href={`#${curveIdRef.current}`} />
          <use
            data-name="path--above-floor"
            clipPath={`url(#${pathAboveClipIdRef.current})`}
            href={`#${curveIdRef.current}`}
          />
          <g data-name="curve-marker">
            <image href={curveMarker} preserveAspectRatio="xMidYMid meet" />
          </g>
        </g>

        <g data-name="initial-price">
          <rect />
          <line />
          <text data-name="label">Initial Price</text>
          <text data-name="value" />
        </g>

        <g data-name="profit-split">
          <line data-name="top" data-orientation="h" />
          <g data-name="middle">
            <line data-orientation="h" />
            <text data-name="split">Profit split</text>
            <text data-name="guarantor-percent"></text>
            <text data-name="consignor-percent"></text>
          </g>
          <line data-name="bottom" data-orientation="h" />
          <line data-name="vertical" data-orientation="v" />
          <g data-name="bars">
            <g data-name="message">
              <text data-name="row1"></text>
              <text data-name="row2"></text>
            </g>
            <g data-name="guarantor">
              <rect />
              <text data-name="label">Guarantor</text>
              <text data-name="value"></text>
            </g>
            <g data-name="consignor">
              <rect data-name="total" />
              <rect data-name="above-floor" />
              <text data-name="label">Consignor</text>
              <text data-name="value"></text>
            </g>
          </g>
          <text data-name="final-price" />
        </g>

        <g data-name="bidding-markers"></g>
      </svg>
    </div>
  );
};

export default AuctionVisualizer;
