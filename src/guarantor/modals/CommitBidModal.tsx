import * as React from "react";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import * as ethers from "ethers";

import { AssetKind } from "../../../lib";
import { GuarantorEscrow, GuarantorEscrowOfferInfo, GuarantorEscrowBidInfo } from "../../../lib";

import { EthereumContext } from "../../helpers";
import { TokenAmount } from "../../components/TokenAmount";
import { EthereumAddress } from "../../components/EthereumAddress";
import { EthereumTransaction, EthereumTransactionStatus } from "../../components/EthereumTransaction";

/******************************************************************************/
/* Commit Bid Modal Component */
/******************************************************************************/

type CommitBidModalProps = {
  open: boolean;
  onClose: () => void;
  context: EthereumContext;
  guarantorEscrow: GuarantorEscrow;
  offerInfo: GuarantorEscrowOfferInfo;
  bidInfo: GuarantorEscrowBidInfo;
};

type CommitBidModalState = {
  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class CommitBidModal extends React.Component<CommitBidModalProps, CommitBidModalState> {
  state: CommitBidModalState = {
    transactionStatus: EthereumTransactionStatus.None,
  };

  async handleClick() {
    let transaction: ethers.ContractTransaction;
    try {
      transaction = await this.props.guarantorEscrow.commit();
    } catch (err) {
      this.setState({...this.state, error: (err instanceof Object) ? `Error: ${err.message}` : err});
      return;
    }

    this.setState({...this.state, transaction, error: undefined, transactionStatus: EthereumTransactionStatus.Pending});
  }

  handleComplete(success: boolean) {
    this.setState({...this.state, transactionStatus: success ? EthereumTransactionStatus.Success : EthereumTransactionStatus.Failure});

    if (success)
      this.props.onClose();
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.onClose} aria-labelledby="simple-modal-title" fullWidth={true}>
        <div>
          <DialogTitle id="simple-modal-title">Commit Bid</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>Seller: <EthereumAddress context={this.props.context} address={this.props.offerInfo.sellerAddress} /></ListItem>
              <ListItem>Escrow: <EthereumAddress context={this.props.context} address={this.props.offerInfo.escrowAddress} /></ListItem>
              <ListItem>Token Address: <EthereumAddress context={this.props.context} address={this.props.offerInfo.asset.tokenAddress} /></ListItem>
              <ListItem>Token ID: {this.props.offerInfo.asset.tokenId.toString()}</ListItem>
              {this.props.offerInfo.asset.kind == AssetKind.ERC1155 && <ListItem>Token Quantity: {this.props.offerInfo.asset.tokenQuantity.toString()}</ListItem>}
              <ListItem>Guaranteed Price: <TokenAmount context={this.props.context} address={this.props.bidInfo.paymentTokenAddress} amount={this.props.bidInfo.price} /></ListItem>
            </List>
            {this.state.error && <b>{this.state.error}</b>}
            {this.state.transaction && <EthereumTransaction context={this.props.context} transaction={this.state.transaction}
                                                            onComplete={(success: boolean) => { this.handleComplete(success); }} />}
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.props.onClose}>
              Close
            </Button>
            <Button color="primary" variant="contained" onClick={() => { this.handleClick(); }}
                    disabled={this.state.transactionStatus == EthereumTransactionStatus.Pending ||
                              this.state.transactionStatus == EthereumTransactionStatus.Success} autoFocus>
              Commit
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    );
  }
}
