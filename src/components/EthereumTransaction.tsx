import * as React from "react";

import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as ethers from "ethers";

import { EthereumContext } from "../helpers";

/******************************************************************************/
/* Ethereum Transaction Component */
/******************************************************************************/

export enum EthereumTransactionStatus {
  None,
  Pending,
  Success,
  Failure,
};

type EthereumTransactionProps = {
  context: EthereumContext;
  transaction: ethers.ContractTransaction;
  onComplete: (success: boolean) => void;
};

type EthereumTransactionState = {
  receipt?: ethers.ContractReceipt;
};

export class EthereumTransaction extends React.Component<EthereumTransactionProps, EthereumTransactionState> {
  state: EthereumTransactionState = {};

  async componentDidMount() {
    const receipt = await this.props.transaction.wait();
    this.setState({...this.state, receipt});

    this.props.onComplete(receipt.status == 1);
  }

  render() {
    if (this.state.receipt && this.state.receipt.status == 1) {
      return (
        <span className="ethereum-transaction">Transaction succeeded! <CheckCircleOutlineOutlinedIcon /></span>
      );
    } else if (this.state.receipt && this.state.receipt.status == 0) {
      return (
        <span className="ethereum-transaction">Transaction failed! <ErrorOutlineOutlinedIcon /></span>
      );
    } else {
      const txid = this.props.transaction.hash.toString();

      if (this.props.context.deployment) {
        return (
          <span className="ethereum-transaction">Pending transaction: <a href={this.props.context.deployment.explorerBaseURL + "/tx/" + txid}>{txid}</a> <CircularProgress /></span>
        );
      } else {
        return (
          <span className="ethereum-transaction">Pending transaction: {txid} <CircularProgress /></span>
        );
      }
    }
  }
}
