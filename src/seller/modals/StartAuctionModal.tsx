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

import {
  SellerEscrow,
  SellerEscrowOfferInfo,
  SellerEscrowBidInfo,
} from '../../../lib';

import { EthereumContext } from '../../helpers';
import { TokenAmount } from '../../components/TokenAmount';

/******************************************************************************/
/* Start Auction Modal Component */
/******************************************************************************/

type StartAuctionModalProps = {
  open: boolean;
  onClose: () => void;
  context: EthereumContext;
  sellerEscrow: SellerEscrow;
  offerInfo: SellerEscrowOfferInfo;
  bidInfo: SellerEscrowBidInfo;
};

type StartAuctionModalState = {
  started: boolean;
  error?: string;
};

export class StartAuctionModal extends React.Component<
  StartAuctionModalProps,
  StartAuctionModalState
> {
  state: StartAuctionModalState = {
    started: false,
  };

  async handleClick() {
    try {
      await this.props.sellerEscrow.startAuction();
    } catch (err) {
      this.setState({ ...this.state, error: err.toString() });
      return;
    }

    this.setState({ ...this.state, started: true });
    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
        aria-labelledby="simple-modal-title"
        fullWidth={true}
      >
        <DialogStyled>
          <DialogTitle id="simple-modal-title">Start Auction</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <Typography variant="h4" subVariant="listItemHeading">
                  Starting Price:{' '}
                </Typography>
                <Typography variant="p">
                  <TokenAmount
                    context={this.props.context}
                    address={this.props.offerInfo.paymentTokenAddress}
                    amount={this.props.offerInfo.startingPrice}
                  />
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="h4" subVariant="listItemHeading">
                  Guaranteed Price:{' '}
                </Typography>
                <Typography variant="p">
                  <TokenAmount
                    context={this.props.context}
                    address={this.props.bidInfo.paymentTokenAddress}
                    amount={this.props.bidInfo.price}
                  />
                </Typography>
              </ListItem>
            </List>
            {this.state.error && <b>{this.state.error}</b>}
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={this.props.onClose}
              variant="text"
              size="small"
            >
              Close
            </Button>
            <Button
              color="primary"
              size="small"
              onClick={() => {
                this.handleClick();
              }}
              disabled={this.state.started}
            >
              Start Auction
            </Button>
          </DialogActions>
        </DialogStyled>
      </Dialog>
    );
  }
}
