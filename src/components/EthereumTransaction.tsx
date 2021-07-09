import * as React from 'react';
import styled from 'styled-components';

import { Typography } from '../components/Typography';
import { ProgressIndicator } from '../components/ProgressIndicator';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';

import * as ethers from 'ethers';

import { EthereumContext } from '../helpers';

/******************************************************************************/
/* Ethereum Transaction Component */
/******************************************************************************/

export enum EthereumTransactionStatus {
  None,
  Pending,
  Success,
  Failure,
}

type EthereumTransactionProps = {
  context: EthereumContext;
  transaction: ethers.ContractTransaction;
  onComplete: (success: boolean) => void;
};

type EthereumTransactionState = {
  receipt?: ethers.ContractReceipt;
};

const TransactionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
export class EthereumTransaction extends React.Component<
  EthereumTransactionProps,
  EthereumTransactionState
> {
  state: EthereumTransactionState = {};

  async componentDidMount() {
    const receipt = await this.props.transaction.wait();
    this.setState({ ...this.state, receipt });
    this.props.onComplete(receipt.status == 1);
  }

  render() {
    if (this.state.receipt && this.state.receipt.status == 1) {
      return (
        <TransactionWrapper>
          <Typography variant="h3">
            Transaction succeeded!{' '}<CheckCircleOutlineOutlinedIcon />
          </Typography>
        </TransactionWrapper>
      );
    } else if (this.state.receipt && this.state.receipt.status == 0) {
      return (
        <TransactionWrapper>
          <Typography variant="h3">
            Transaction failed!{' '}<ErrorOutlineOutlinedIcon />
          </Typography>
        </TransactionWrapper>
      );
    } else {
      const txid = this.props.transaction.hash.toString();

      if (this.props.context.deployment) {
        return (
          <TransactionWrapper>
            <Typography variant="h3">Pending transaction: </Typography>
            <Typography
              variant="a"
              target="_blank"
              href={
                this.props.context.deployment.explorerBaseURL + '/tx/' + txid
              }
            >
              {`${txid.slice(0, 24)}...`}
            </Typography>{' '}
            <ProgressIndicator />
          </TransactionWrapper>
        );
      } else {
        return (
          <TransactionWrapper>
            <Typography variant="h3">Pending transaction:</Typography>
            {`${txid.slice(0, 24)}...`} <ProgressIndicator />
          </TransactionWrapper>
        );
      }
    }
  }
}
