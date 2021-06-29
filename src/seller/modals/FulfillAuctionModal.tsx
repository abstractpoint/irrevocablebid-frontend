import * as React from "react";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import * as ethers from "ethers";

import { BuyOrderWithSignature } from "../../../lib";
import { SellerEscrow } from "../../../lib";

import { EthereumContext } from "../../helpers";
import { EthereumAddress } from "../../components/EthereumAddress";
import { TokenAmount } from "../../components/TokenAmount";
import { EthereumTransaction, EthereumTransactionStatus } from "../../components/EthereumTransaction";

/******************************************************************************/
/* Fulfill Auction Modal Component */
/******************************************************************************/

type FulfillAuctionModalProps = {
  open: boolean;
  onClose: () => void;
  context: EthereumContext;
  sellerEscrow: SellerEscrow;
};

type FulfillAuctionModalState = {
  buyOrders: BuyOrderWithSignature[];
  index: number | null;

  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class FulfillAuctionModal extends React.Component<FulfillAuctionModalProps, FulfillAuctionModalState> {
  state: FulfillAuctionModalState = {
    buyOrders: [],
    index: null,
    transactionStatus: EthereumTransactionStatus.None,
  };

  componentDidMount() {
    this.refreshBuyOrders();
  }

  handleSelect(index: number) {
    this.setState({...this.state, index});
  }

  async refreshBuyOrders() {
    let buyOrders: BuyOrderWithSignature[] = [];
    try {
      buyOrders = await this.props.sellerEscrow.pollOffers();
    } catch (err) {
      this.setState({...this.state, error: err.toString()});
      return;
    }

    this.setState({...this.state, buyOrders, error: undefined, index: null});
  }

  async handleClick() {
    if (this.state.index === null)
      return;

    const buyOrder = this.state.buyOrders[this.state.index];

    let transaction: ethers.ContractTransaction;
    try {
      transaction = await this.props.sellerEscrow.execute(buyOrder);
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
          <DialogTitle id="simple-modal-title">Fulfill Auction</DialogTitle>
          <DialogContent>
            <List>
              {this.state.buyOrders.map((buyOrder, index) => {
                const isGuarantor = this.props.sellerEscrow && this.props.sellerEscrow.buyOrder !== null &&
                                      buyOrder.maker == this.props.sellerEscrow.buyOrder.maker;
                return (
                  <ListItem key={index} role={undefined} dense button selected={this.state.index == index}
                            onClick={() => { this.handleSelect(index); }}>
                    <ListItemText primary={`${isGuarantor ? "Guarantor" : buyOrder.maker}`} />
                    <ListItemSecondaryAction>
                      <TokenAmount context={this.props.context} address={buyOrder.paymentToken} amount={buyOrder.basePrice} />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
            {this.state.error && <b>{this.state.error}</b>}
            {this.state.transaction && <EthereumTransaction context={this.props.context} transaction={this.state.transaction}
                                                            onComplete={(success: boolean) => { this.handleComplete(success); }} />}
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="contained" onClick={() => { this.refreshBuyOrders(); }}>
              Refresh
            </Button>
            <div style={{flex: '1 0 0'}} />
            <Button color="primary" onClick={this.props.onClose}>
              Close
            </Button>
            <Button color="primary" variant="contained" onClick={() => { this.handleClick(); }}
                    disabled={this.state.transactionStatus == EthereumTransactionStatus.Pending ||
                              this.state.transactionStatus == EthereumTransactionStatus.Success ||
                              this.state.index === null} autoFocus>
              Execute
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    );
  }
}
