import * as React from 'react';
import * as ethers from 'ethers';

import AuctionVisualizer from '../../components/AuctionVisualizer';
import { AuctionVisualizerFeed } from '../../components/AuctionVisualizer/types';

import { BigNumber } from '@ethersproject/bignumber';
import {
  SellerEscrowContractInfo,
  SellerEscrowBidInfo,
  SellerEscrow,
} from '../../../lib';
import { SellerEscrowOfferInfo } from '../../../lib';
import { BuyOrderWithSignature } from '../../../lib';

import { EthereumContext, lookupTokenInfo } from '../../helpers';

type VisualizerPanelProps = {
  context: EthereumContext;
  offerInfo: SellerEscrowOfferInfo;
  sellerEscrow: SellerEscrow;
  contractInfo: SellerEscrowContractInfo;
  bidInfo: SellerEscrowBidInfo;
};

type BuyPrice = {
  time: Date;
  price: number;
  by: string;
};

export const VisualizerPanel = (props: VisualizerPanelProps) => {
  const [demoState] = React.useState<{ [key: string]: number }>({
    initialPrice: 150,
    guaranteedPrice: 1000,
    split: 0.2,
    auctionLength: 5 * 1000,
  });
  const [startingPrice, setStartingPrice] = React.useState<number>(0);
  const [split, setSplit] = React.useState<number>(0);
  const [guaranteedPrice, setGuaranteedPrice] = React.useState<number>(0);
  const [auctionLength, setAuctionLength] = React.useState<number>(0);
  const [testPrices, setTestPrices] = React.useState<number[]>([]);
  const [loadPrices, setLoadPrices] = React.useState<number[]>([]);
  const [index, setIndex] = React.useState<number>(0);
  const [priceFeed, setPriceFeed] = React.useState<AuctionVisualizerFeed>({
    prices: [],
    done: false,
  });
  const [buyPrice, setBuyPrice] = React.useState<BuyPrice[]>([]);
  const [startTime, setStartTime] = React.useState<number>(Date.now());
  const [demoMode, setDemoMode] = React.useState<boolean>(false);

  function startAboveEnding() {
    reset();
    setTestPrices([200, 450, 600, 620, 900, 940, 1100, 1400, 1610]);
  }

  function startBelowEnding() {
    reset();
    setTestPrices([160, 450, 600, 620, 800, 900]);
  }

  function reset() {
    if (!props.sellerEscrow.buyOrder) {
      return;
    }
    setStartTime(Date.now());

    setPriceFeed({
      prices: [
        {
          time: new Date(),
          price: 0,
          by: '',
        },
      ],
      done: false,
    });
  }
  const getStartingPrice = async () => {
    if (!props.context || !props.context.provider || !props.offerInfo) {
      return;
    }

    const sPrice =
      (await getCryptoAmount(
        props.offerInfo.startingPrice,
        props.offerInfo.paymentTokenAddress
      )) || '';

    setStartingPrice(parseFloat(sPrice));
  };

  const getSplit = () => {
    const splitBasisPoints = props.contractInfo.guarantorSellerSplitBasisPoints;
    setSplit(splitBasisPoints / 10000);
  };

  const getCryptoAmount = async (
    price: BigNumber,
    address: string
  ): Promise<string | undefined> => {
    if (!props.context.provider) {
      return;
    }

    const { decimals } = await lookupTokenInfo(props.context.provider, address);

    return ethers.utils.formatUnits(price, decimals);
  };

  const getGuaranteedPrice = async () => {
    if (!props.context.provider) {
      return;
    }

    const price =
      (await getCryptoAmount(
        props.bidInfo.price,
        props.bidInfo.paymentTokenAddress
      )) || '';
    setGuaranteedPrice(parseFloat(price));
  };

  const getAuctionLength = () => {
    if (!props.sellerEscrow.buyOrder) {
      return;
    }
    const start = new Date(
      props.sellerEscrow.buyOrder.listingTime.toNumber()
    ).getTime();
    const end = new Date(props.contractInfo.expirationTime).getTime();
    setAuctionLength(end - start);

    const startTime = new Date(
      props.sellerEscrow.buyOrder.listingTime.toNumber() * 1000
    );
    setPriceFeed({
      prices: [
        {
          time: startTime,
          price: 0,
          by: '',
        },
      ],
      done: false,
    });
  };

  async function getCurrentBids() {
    let buyPrices: BuyOrderWithSignature[] = [];
    try {
      buyPrices = await props.sellerEscrow.pollOffers();
    } catch (err) {
      console.log('Error: ', err);
      return;
    }

    const newLoadPrices: number[] = [];
    const newBuyPrice = buyPrices.map(async (buyOrder) => {
      const price =
        (await getCryptoAmount(buyOrder.basePrice, buyOrder.paymentToken)) ||
        '';
      newLoadPrices.push(buyOrder.basePrice.toNumber());
      return {
        price: parseFloat(price),
        by: buyOrder.maker,
        time: new Date(buyOrder.listingTime.toNumber() * 1000),
      };
    });
    Promise.all(newBuyPrice).then((values) => {
      setBuyPrice(values);
    });
    setLoadPrices(newLoadPrices);
    setIndex(0);
  }

  React.useEffect(() => {
    startAboveEnding();
    getStartingPrice();
    getSplit();
    getAuctionLength();
    getGuaranteedPrice();
    getCurrentBids();
  }, []);

  React.useEffect(() => {
    if (buyPrice.length && index < buyPrice.length - 1) {
      const timeoutId = setTimeout(() => {
        const newPrice = buyPrice[index] || 0;
        setPriceFeed({
          prices: priceFeed.prices.concat([
            {
              ...buyPrice[index],
            },
          ]),
          done: buyPrice.length === 1,
        });
        setIndex(index + 1);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }

    if (demoMode && testPrices.length) {
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
  (window as any).setDemoMode = function (flag: boolean) {
    setDemoMode(flag);
    if (flag) {
      setStartingPrice(demoState.initialPrice);
      setSplit(demoState.split);
      setGuaranteedPrice(demoState.guaranteedPrice);
      setAuctionLength(demoState.auctionLength);
      reset();
    }
  };

  return (
    <div>
      <AuctionVisualizer
        priceFeed={priceFeed}
        guarantorSellerSplitPercent={split}
        initialPrice={startingPrice}
        guaranteedPrice={guaranteedPrice}
        auctionLength={auctionLength}
      />
    </div>
  );
};
