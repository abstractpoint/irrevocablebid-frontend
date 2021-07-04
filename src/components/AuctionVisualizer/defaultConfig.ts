import { AuctionVisualizerConfig } from './types';
import * as d3 from 'd3';

const defaultConfig: AuctionVisualizerConfig = {
  // size: [754, 460], // original
  size: [560, 460],
  margin: { top: 65, right: 250, bottom: 65, left: 0 },
  curveType: d3.curveBumpX,
  currencyFormat: '$.1d',
  endingDuration: 1500,
  endingEase: d3.easeCubic,
  lineExtend: 40,
  marker: {
    radius: 4,
  },
  endMarker: {
    width: 35,
    height: 65,
    transform: 'translate(-17, -50)',
  },
  tooltip: {
    generator: (d, i) => [
      [`Bid #${i}`, ''],
      ['Time:', d3.timeFormat('%c')(d.time)],
      ['Bid amount:', d3.format('$.1d')(d.price)],
      ['Submitted by:', d.by.replace(/(^.{6}).*(.{4}$)/, '$1...$2')],
    ],
    offset: [15, 0],
    colorScheme: [
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ],
  },
};

export default defaultConfig;
