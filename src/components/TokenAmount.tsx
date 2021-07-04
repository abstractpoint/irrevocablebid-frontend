import * as React from 'react';

import * as ethers from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

import { EthereumContext, lookupTokenInfo } from '../helpers';

/******************************************************************************/
/* Token Amount Component */
/******************************************************************************/

type TokenAmountProps = {
  context: EthereumContext;
  address: string;
  amount: BigNumber;
};

type TokenAmountState = {
  decimals?: number;
  symbol?: string;
};

export class TokenAmount extends React.Component<TokenAmountProps, {}> {
  state: TokenAmountState = {
    decimals: undefined,
    symbol: undefined,
  };

  async componentDidMount() {
    if (!this.props.context.provider) return;

    try {
      const { symbol, decimals } = await lookupTokenInfo(
        this.props.context.provider,
        this.props.address
      );
      this.setState({ decimals, symbol });
    } catch (error) {
      return;
    }
  }

  render() {
    if (!this.state.decimals || !this.state.symbol) {
      return (
        <span className="token-amount">{this.props.amount.toString()}</span>
      );
    }

    return (
      <span className="token-amount">
        {ethers.utils.formatUnits(this.props.amount, this.state.decimals)}{' '}
        {this.state.symbol}
      </span>
    );
  }
}
