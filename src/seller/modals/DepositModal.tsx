import * as React from 'react';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { DialogStyled } from '../../components/DialogStyled';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import styled from 'styled-components';

import * as ethers from 'ethers';

import { AssetKind } from '../../../lib';
import { SellerEscrow, SellerEscrowOfferInfo } from '../../../lib';

import { EthereumContext } from '../../helpers';
import { EthereumAddress } from '../../components/EthereumAddress';
import {
  EthereumTransaction,
  EthereumTransactionStatus,
} from '../../components/EthereumTransaction';

/******************************************************************************/
/* Deposit Modal Component */
/******************************************************************************/

type DepositModalProps = {
  open: boolean;
  onClose: () => void;
  context: EthereumContext;
  sellerEscrow: SellerEscrow;
  offerInfo: SellerEscrowOfferInfo;
};

type DepositModalState = {
  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class DepositModal extends React.Component<
  DepositModalProps,
  DepositModalState
> {
  state: DepositModalState = {
    transactionStatus: EthereumTransactionStatus.None,
  };

  async handleClick() {
    let transaction: ethers.ContractTransaction;
    try {
      transaction = await this.props.sellerEscrow.deposit();
    } catch (err) {
      this.setState({ ...this.state, error: err.toString() });
      return;
    }

    this.setState({
      ...this.state,
      transaction,
      error: undefined,
      transactionStatus: EthereumTransactionStatus.Pending,
    });
  }

  handleComplete(success: boolean) {
    this.setState({
      ...this.state,
      transactionStatus: success
        ? EthereumTransactionStatus.Success
        : EthereumTransactionStatus.Failure,
    });

    if (success) this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
        aria-labelledby="simple-modal-title"
      >
        <DialogStyled>
          <DialogTitle id="simple-modal-title">Deposit NFT</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <Typography variant="h4" subVariant="listItemHeading">
                  Token Address:{' '}
                </Typography>
                <EthereumAddress
                  variant="view"
                  context={this.props.context}
                  address={this.props.offerInfo.asset.tokenAddress}
                />
              </ListItem>
              <ListItem>
                <Typography variant="h4" subVariant="listItemHeading">
                  Token ID:{' '}
                </Typography>
                <Typography variant="p">
                  {this.props.offerInfo.asset.tokenId.toString()}
                </Typography>
              </ListItem>
              {this.props.offerInfo.asset.kind == AssetKind.ERC1155 && (
                <ListItem>
                  <Typography variant="h4" subVariant="listItemHeading">
                    Token Quantity:{' '}
                  </Typography>
                  <Typography variant="p">
                    {this.props.offerInfo.asset.tokenQuantity.toString()}
                  </Typography>
                </ListItem>
              )}
            </List>
            {this.state.error && (
              <Typography variant="error">{this.state.error}</Typography>
            )}
            {this.state.transaction && (
              <EthereumTransaction
                context={this.props.context}
                transaction={this.state.transaction}
                onComplete={(success: boolean) => {
                  this.handleComplete(success);
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="text"
              size="small"
              onClick={this.props.onClose}
            >
              Close
            </Button>
            <Button
              color="primary"
              size="small"
              onClick={() => {
                this.handleClick();
              }}
              disabled={
                this.state.transactionStatus ==
                  EthereumTransactionStatus.Pending ||
                this.state.transactionStatus ==
                  EthereumTransactionStatus.Success
              }
            >
              Deposit
            </Button>
          </DialogActions>
        </DialogStyled>
      </Dialog>
    );
  }
}
