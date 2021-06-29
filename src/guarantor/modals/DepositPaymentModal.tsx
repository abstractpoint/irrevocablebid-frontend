import * as React from "react";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import * as ethers from "ethers";

import { GuarantorEscrow, GuarantorEscrowBidInfo } from "../../../lib";

import { EthereumContext } from "../../helpers";
import { TokenAmount } from "../../components/TokenAmount";
import { EthereumTransaction, EthereumTransactionStatus } from "../../components/EthereumTransaction";

/******************************************************************************/
/* Deposit Payment Modal Component */
/******************************************************************************/

type DepositPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  context: EthereumContext;
  guarantorEscrow: GuarantorEscrow;
  bidInfo: GuarantorEscrowBidInfo;
};

type DepositPaymentModalState = {
  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class DepositPaymentModal extends React.Component<DepositPaymentModalProps, DepositPaymentModalState> {
  state: DepositPaymentModalState = {
    transactionStatus: EthereumTransactionStatus.None,
  };

  async handleClick() {
    let transaction: ethers.ContractTransaction;
    try {
      transaction = await this.props.guarantorEscrow.deposit();
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
      <Dialog open={this.props.open} onClose={this.props.onClose} aria-labelledby="simple-modal-title" >
        <div>
          <DialogTitle id="simple-modal-title">Deposit Payment</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>Amount: <TokenAmount context={this.props.context} address={this.props.bidInfo.paymentTokenAddress} amount={this.props.bidInfo.price} /></ListItem>
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
              Deposit
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    );
  }
}
