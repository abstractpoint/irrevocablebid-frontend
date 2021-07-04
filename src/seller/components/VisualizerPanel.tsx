import * as React from 'react';

import AuctionVisualizer from '../../components/AuctionVisualizer';
import { AuctionVisualizerFeed } from '../../components/AuctionVisualizer/types';

import { BuyOrderWithSignature } from '../../../lib';

type VisualizerPanelProps = {
  pollOffers?: (() => Promise<BuyOrderWithSignature[]>) | null;
};

/** 
// priceFeed: AuctionVisualizerFeed;
// guarantorSellerSplitPercent: number; sellerEscrowInfo.contractInfo.guarantorSellerSplitBasisPoints / 10
// 5100 => 51.00%
// initialPrice: number;
// guaranteedPrice: number;
// auctionLength: number;
1626287363
*/

const initialPrice = 150;
const guaranteedPrice = 1000;
const split = 0.2;
// const auctionLength = 5 * 1000; // 5 seconds for the demo
// const testPrices = [];
// const priceFeed = {
//   prices: [{ time: new Date(), price: 0, by: '' }],
//   done: false,
// };
export const VisualizerPanel = (props: VisualizerPanelProps) => {
  /**
   * 
      const { symbol, decimals } = await lookupTokenInfo(
        this.props.context.provider,
        this.props.address
      );
   */

  const initialPrice = 150;
  const guaranteedPrice = 1000;
  const split = 0.2;
  const auctionLength = 5 * 1000; // 5 seconds for the demo
  const [testPrices, setTestPrices] = React.useState<number[]>([]);
  const [priceFeed, setPriceFeed] = React.useState<AuctionVisualizerFeed>({
    prices: [{ time: new Date(), price: 0, by: '' }],
    done: false,
  });
  const [startTime, setStartTime] = React.useState(Date.now());

  function startAboveEnding() {
    reset();
    setTestPrices([200, 450, 600, 620, 900, 940, 1100, 1400, 1610]);
  }

  function startBelowEnding() {
    reset();
    setTestPrices([160, 450, 600, 620, 800, 900]);
  }

  function reset() {
    setStartTime(Date.now());
    setPriceFeed({
      prices: [{ time: new Date(), price: 0, by: '' }],
      done: false,
    });
  }
  React.useEffect(() => {
    startAboveEnding();
  }, []);

  React.useEffect(() => {
    if (testPrices.length) {
      const timeoutId = setTimeout(() => {
        const newPrice = testPrices[0] || 0;
        setPriceFeed({
          prices: priceFeed.prices.concat([
            {
              time: new Date(
                startTime +
                  (priceFeed.prices.length /
                    (priceFeed.prices.length + testPrices.length - 1)) *
                    auctionLength
              ),
              price: newPrice,
              by: '0x14rPtntr7WEawK0jXHpKcRvFVPDfCkGPt',
            },
          ]),
          done: testPrices.length === 1,
        });
        setTestPrices(testPrices.slice(1));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  });

  return (
    <div>
      <AuctionVisualizer
        priceFeed={priceFeed}
        guarantorSellerSplitPercent={split}
        initialPrice={initialPrice}
        guaranteedPrice={guaranteedPrice}
        auctionLength={auctionLength}
      />
    </div>
  );
};
