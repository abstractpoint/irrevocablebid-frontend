import * as React from 'react';
import * as ethers from 'ethers';

import AuctionVisualizer from '../../components/AuctionVisualizer';
import {
  AuctionVisualizerBid,
  AuctionVisualizerFeed,
} from '../../components/AuctionVisualizer/types';

import { BigNumber } from '@ethersproject/bignumber';
import {
  SellerEscrow,
  SellerEscrowContractInfo,
  SellerEscrowOfferInfo,
  SellerEscrowBidInfo,
} from '../../../lib';
import { BuyOrderWithSignature } from '../../../lib';

import { EthereumContext, lookupTokenInfo } from '../../helpers';

/******************************************************************************/
/* Visualizer Panel Component */
/******************************************************************************/

type VisualizerPanelProps = {
  context: EthereumContext;
  sellerEscrow: SellerEscrow;
  contractInfo: SellerEscrowContractInfo;
  offerInfo: SellerEscrowOfferInfo;
  bidInfo: SellerEscrowBidInfo;
  executed: boolean;
};

type VisualizerPanelState = {
  guarantorSellerSplitPercent: number;
  initialPrice: number;
  guaranteedPrice: number;
  auctionLength: number;
  priceFeed: AuctionVisualizerFeed;
  refreshTimer: number | null;
};

export class VisualizerPanel extends React.Component<
  VisualizerPanelProps,
  VisualizerPanelState
> {
  state: VisualizerPanelState = {
    guarantorSellerSplitPercent: 0,
    initialPrice: 0,
    guaranteedPrice: 0,
    auctionLength: 0,
    priceFeed: {
      prices: [],
      done: false,
    },
    refreshTimer: null,
  };

  async componentDidMount() {
    if (
      !this.props.context.provider ||
      !this.props.context.deployment ||
      !this.props.sellerEscrow.buyOrder
    )
      return;

    const guarantorSellerSplitPercent =
      this.props.contractInfo.guarantorSellerSplitBasisPoints / 10000;
    const initialPrice = await this.tokenPriceToFloat(
      this.props.offerInfo.startingPrice,
      this.props.offerInfo.paymentTokenAddress
    );
    const guaranteedPrice = await this.tokenPriceToFloat(
      this.props.bidInfo.price,
      this.props.bidInfo.paymentTokenAddress
    );
    const auctionLength =
      this.props.sellerEscrow.buyOrder.expirationTime
        .sub(this.props.sellerEscrow.buyOrder.listingTime)
        .toNumber() - this.props.context.deployment.exchangeMatchingLatency;
    const refreshTimer = window.setInterval(() => {
      this.refreshPrices();
    }, 30 * 1000);

    this.setState({
      guarantorSellerSplitPercent,
      initialPrice,
      guaranteedPrice,
      auctionLength,
      refreshTimer,
    });

    /* Delay initial refresh from page load to reduce request load on OpenSea */
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await this.refreshPrices();
  }

  async tokenPriceToFloat(
    tokenPrice: BigNumber,
    tokenAddress: string
  ): Promise<number> {
    if (!this.props.context.provider) return 0;

    const { decimals } = await lookupTokenInfo(
      this.props.context.provider,
      tokenAddress
    );

    return parseFloat(ethers.utils.formatUnits(tokenPrice, decimals));
  }

  async refreshPrices() {
    let offers: BuyOrderWithSignature[];
    try {
      offers = await this.props.sellerEscrow.pollOffers();
    } catch (err) {
      console.error(err);
      return;
    }

    /* Sort offers by timestamp */
    offers.sort((a, b) => {
      return a.listingTime.lt(b.listingTime) ? -1 : 1;
    });

    /* Translate BuyOrderWithSignature[] offers to AuctionVisualizerBid[] prices */
    const prices = await Promise.all(
      offers.map(
        async (offer: BuyOrderWithSignature): Promise<AuctionVisualizerBid> => {
          const price = await this.tokenPriceToFloat(
            offer.basePrice,
            offer.paymentToken
          );
          return {
            price,
            by: offer.maker,
            time: new Date(offer.listingTime.toNumber() * 1000),
          };
        }
      )
    );

    const initialPrice: AuctionVisualizerBid = {
      price: this.state.initialPrice,
      by: '',
      time: new Date((offers[0].listingTime.toNumber() - 60) * 1000),
    };

    this.setState({
      priceFeed: {
        prices: [initialPrice, ...prices],
        done: this.props.executed,
      },
    });
  }

  render() {
    return (
      <div>
        <AuctionVisualizer
          priceFeed={this.state.priceFeed}
          guarantorSellerSplitPercent={this.state.guarantorSellerSplitPercent}
          initialPrice={this.state.initialPrice}
          guaranteedPrice={this.state.guaranteedPrice}
          auctionLength={this.state.auctionLength}
        />
      </div>
    );
  }
}
