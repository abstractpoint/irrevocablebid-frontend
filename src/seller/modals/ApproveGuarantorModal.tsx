import * as React from "react";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import * as ethers from "ethers";

import { BuyOrder } from "../../../lib";
import { SellerEscrow } from "../../../lib";
import { serializeSellOrder } from "../../../lib";

import { EthereumContext, decodeBuyOrder } from "../../helpers";
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
  buyOrderData: string;

  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class ApproveGuarantorModal extends React.Component<ApproveGuarantorModalProps, ApproveGuarantorModalState> {
  state: ApproveGuarantorModalState = {
    buyOrderData: "",
    transactionStatus: EthereumTransactionStatus.None,
  };

  async handleClick() {
    if (!this.props.context.deployment)
      return;

    let buyOrder: BuyOrder | null = null;
    try {
      buyOrder = decodeBuyOrder(this.props.context.deployment, this.props.sellerEscrow.sellOrder, this.state.buyOrderData);
    } catch (err) {
      alert(`Invalid buy order: ${err}`);
    }

    if (!buyOrder)
      return;

    let transaction: ethers.ContractTransaction;
    try {
      transaction = await this.props.sellerEscrow.commit(buyOrder);
    } catch (err) {
      this.setState({...this.state, error: (err instanceof Object) ? `Error: ${err.message}` : err});
      return;
    }

    this.setState({...this.state, transaction, error: undefined, transactionStatus: EthereumTransactionStatus.Pending});
  }

  handleChange(value: string) {
    this.setState({...this.state, buyOrderData: value});
  }

  handleComplete(success: boolean) {
    this.setState({...this.state, transactionStatus: success ? EthereumTransactionStatus.Success : EthereumTransactionStatus.Failure});

    if (success)
      this.redirectSeller();
  }

  redirectSeller() {
    if (!this.props.sellerEscrow)
      return;

    /* FIXME this is hacky to do in a modal */

    /* Serialize orders */
    const sellOrderData = serializeSellOrder(this.props.sellerEscrow.sellOrder);

    /* Create updated URL */
    const urlSearchParams = new URLSearchParams({sell: sellOrderData, buy: this.state.buyOrderData});
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
                              this.state.transactionStatus == EthereumTransactionStatus.Success} autoFocus>
              Approve
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    );
  }
}
