import * as React from "react";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import * as ethers from "ethers";

import { BuyOrder } from "../../../lib";
import { SellerEscrow, SellerEscrowBidInfo } from "../../../lib";
import { validateGuarantorEscrow } from "../../../lib";
import { serializeSellOrder, serializeBuyOrder } from "../../../lib";

import { EthereumContext, decodeBuyOrder } from "../../helpers";
import { EthereumAddress } from "../../components/EthereumAddress";
import { TokenAmount } from "../../components/TokenAmount";
import { EthereumTransaction, EthereumTransactionStatus } from "../../components/EthereumTransaction";

/******************************************************************************/
/* Approve Guarantor Modal Component */
/******************************************************************************/

type ApproveGuarantorModalProps = {
  open: boolean;
  onClose: () => void;
  context: EthereumContext;
  sellerEscrow: SellerEscrow;
};

type ApproveGuarantorModalState = {
  buyOrder: BuyOrder | null;
  bidInfo: SellerEscrowBidInfo | null;

  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class ApproveGuarantorModal extends React.Component<ApproveGuarantorModalProps, ApproveGuarantorModalState> {
  state: ApproveGuarantorModalState = {
    buyOrder: null,
    bidInfo: null,
    transactionStatus: EthereumTransactionStatus.None,
  };

  async handleClick() {
    if (!this.props.context.deployment || !this.state.buyOrder)
      return;

    let transaction: ethers.ContractTransaction;
    try {
      transaction = await this.props.sellerEscrow.commit(this.state.buyOrder);
    } catch (err) {
      this.setState({...this.state, error: (err instanceof Object) ? `Error: ${err.message}` : err});
      return;
    }

    this.setState({...this.state, transaction, error: undefined, transactionStatus: EthereumTransactionStatus.Pending});
  }

  async handleChange(value: string) {
    if (!this.props.context.deployment || !this.props.context.provider)
      return;

    let buyOrder: BuyOrder | null = null;
    try {
      buyOrder = decodeBuyOrder(this.props.context.deployment, this.props.sellerEscrow.sellOrder, value);
    } catch (err) {
      this.setState({...this.state, error: (err instanceof Object) ? `Error: ${err.message}` : err});
      return;
    }

    if (buyOrder) {
      try {
        await validateGuarantorEscrow(this.props.context.provider, this.props.context.deployment, buyOrder);
      } catch(err) {
        this.setState({...this.state, error: (err instanceof Object) ? `Error: ${err.message}` : err});
        return;
      }
    }

    const sellerEscrow = new SellerEscrow(this.props.context.provider, this.props.context.deployment, this.props.sellerEscrow.sellOrder, buyOrder);
    const bidInfo = await sellerEscrow.getBidInfo();

    this.setState({...this.state, buyOrder, bidInfo});
  }

  handleComplete(success: boolean) {
    this.setState({...this.state, transactionStatus: success ? EthereumTransactionStatus.Success : EthereumTransactionStatus.Failure});

    if (success)
      this.redirectSeller();
  }

  redirectSeller() {
    if (!this.props.sellerEscrow || !this.state.buyOrder)
      return;

    /* FIXME this is hacky to do in a modal */

    /* Serialize orders */
    const sellOrderData = serializeSellOrder(this.props.sellerEscrow.sellOrder);
    const buyOrderData = serializeBuyOrder(this.state.buyOrder);

    /* Create updated URL */
    const urlSearchParams = new URLSearchParams({sell: sellOrderData, buy: buyOrderData});
    const sellerURL = window.location.origin + "/#/seller/?" + urlSearchParams.toString();

    /* Redirect to URL */
    window.location.replace(sellerURL);

    this.props.onClose();
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.onClose} aria-labelledby="simple-modal-title" fullWidth={true}>
        <div>
          <DialogTitle id="simple-modal-title">Approve Guarantor</DialogTitle>
          <DialogContent>
            {this.state.bidInfo &&
              <List>
                <ListItem>Guarantor: <EthereumAddress context={this.props.context} address={this.state.bidInfo.guarantorAddress} /></ListItem>
                <ListItem>Escrow: <EthereumAddress context={this.props.context} address={this.state.bidInfo.escrowAddress} /></ListItem>
                <ListItem>Price: <TokenAmount context={this.props.context} address={this.state.bidInfo.paymentTokenAddress} amount={this.state.bidInfo.price} /></ListItem>
              </List>}
            <TextField label="Guarantor Bid" multiline fullWidth rows={4} variant="outlined"
                       onChange={(event: any) => { this.handleChange(event.target.value); }} />
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
                              this.state.transactionStatus == EthereumTransactionStatus.Success ||
                              this.state.buyOrder === null} autoFocus>
              Approve
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    );
  }
}
