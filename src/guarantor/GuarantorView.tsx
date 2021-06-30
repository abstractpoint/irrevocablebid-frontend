import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { SellOrder, BuyOrder } from "../../lib";
import { validateSellerEscrow, validateGuarantorEscrow } from "../../lib";
import { GuarantorEscrow, GuarantorEscrowState, GuarantorEscrowContractInfo, GuarantorEscrowOfferInfo,
         GuarantorEscrowBidInfo, GuarantorEscrowSettlementInfo } from "../../lib";

import { EthereumContext, decodeSellOrder, decodeBuyOrder } from "../helpers";

import { ContractInfo } from "./components/ContractInfo";
import { OfferInfo } from "./components/OfferInfo";
import { BidInfo } from "./components/BidInfo";
import { SettlementInfo } from "./components/SettlementInfo";

import { DepositPaymentModal } from "./modals/DepositPaymentModal";
import { CommitBidModal } from "./modals/CommitBidModal";
import { ShowBidModal } from "./modals/ShowBidModal";
import { SettleModal } from "./modals/SettleModal";
import { WithdrawNFTModal } from "./modals/WithdrawNFTModal";

/******************************************************************************/
/* Top-level Guarantor View Component */
/******************************************************************************/

enum GuarantorViewModal {
  DepositPayment,
  CommitBid,
  GetBid,
  Settle,
  WithdrawNFT,
}

const GuarantorViewButtons: {
  name: string,
  modal: GuarantorViewModal,
  isVisible: (state: GuarantorEscrowState) => boolean,
  isComplete: (state: GuarantorEscrowState) => boolean,
}[] = [
  {
    name: "Deposit Payment",
    modal: GuarantorViewModal.DepositPayment,
    isVisible: (state: GuarantorEscrowState) => { return state == GuarantorEscrowState.Created; },
    isComplete: (state: GuarantorEscrowState) => { return state >= GuarantorEscrowState.Deposited; },
  },
  {
    name: "Commit Bid",
    modal: GuarantorViewModal.CommitBid,
    isVisible: (state: GuarantorEscrowState) => { return state == GuarantorEscrowState.Deposited; },
    isComplete: (state: GuarantorEscrowState) => { return state >= GuarantorEscrowState.Committed; },
  },
  {
    name: "Get Bid",
    modal: GuarantorViewModal.GetBid,
    isVisible: (state: GuarantorEscrowState) => { return state == GuarantorEscrowState.Committed; },
    isComplete: (state: GuarantorEscrowState) => { return state >= GuarantorEscrowState.Accepted; },
  },
  {
    name: "Settle",
    modal: GuarantorViewModal.Settle,
    isVisible: (state: GuarantorEscrowState) => { return state == GuarantorEscrowState.Executed; },
    isComplete: (state: GuarantorEscrowState) => { return state >= GuarantorEscrowState.Released; },
  },
];

type GuarantorViewProps = RouteComponentProps<{}> & {
  context: EthereumContext;
};

type GuarantorViewState = {
  guarantorEscrow: GuarantorEscrow | null;
  guarantorEscrowInfo: {
    isOwner: boolean;
    state: GuarantorEscrowState | null;
    contractInfo: GuarantorEscrowContractInfo | null;
    offerInfo: GuarantorEscrowOfferInfo | null;
    bidInfo: GuarantorEscrowBidInfo | null;
    projectedSettlementInfo: GuarantorEscrowSettlementInfo | null;
    settlementInfo: GuarantorEscrowSettlementInfo | null;
    hasAsset: boolean;
  };
  modalOpen: GuarantorViewModal | null;
};

export class GuarantorViewComponent extends React.Component<GuarantorViewProps, GuarantorViewState> {
  state: GuarantorViewState = {
    guarantorEscrow: null,
    guarantorEscrowInfo: {
      isOwner: false,
      state: null,
      contractInfo: null,
      offerInfo: null,
      bidInfo: null,
      projectedSettlementInfo: null,
      settlementInfo: null,
      hasAsset: false,
    },
    modalOpen: null
  };

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const sellOrderData = params.get('sell');
    const buyOrderData = params.get('buy');
    this.instantiate(sellOrderData, buyOrderData);

    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      this.refreshState();
    });
  }

  async instantiate(sellOrderData: string | null, buyOrderData: string | null) {
    if (!this.props.context.provider || !this.props.context.deployment)
      return;

    let sellOrder: SellOrder | null = null;
    let buyOrder: BuyOrder | null = null;

    try {
      sellOrder = decodeSellOrder(this.props.context.deployment, sellOrderData);
    } catch (err) {
      alert(`Invalid sell order in seller link: ${err}`);
    }

    try {
      buyOrder = decodeBuyOrder(this.props.context.deployment, sellOrder, buyOrderData);
    } catch (err) {
      alert(`Invalid buy order in seller link: ${err}`);
    }

    if (sellOrder) {
      try {
        await validateSellerEscrow(this.props.context.provider, this.props.context.deployment, sellOrder);
      } catch(err) {
        alert(`Invalid seller escrow: ${err}`);
        sellOrder = null;
      }
    }

    if (buyOrder) {
      try {
        await validateGuarantorEscrow(this.props.context.provider, this.props.context.deployment, buyOrder);
      } catch(err) {
        alert(`Invalid guarantor escrow: ${err}`);
        buyOrder = null;
      }
    }

    if (!sellOrder || !buyOrder)
      return;

    const guarantorEscrow = new GuarantorEscrow(this.props.context.provider, this.props.context.deployment, sellOrder, buyOrder);
    this.setState({...this.state, guarantorEscrow});

    await this.refreshState();
  }

  async refreshState() {
    if (!this.state.guarantorEscrow)
      return;

    const isOwner = await this.state.guarantorEscrow.isOwner();
    const state = await this.state.guarantorEscrow.getState();
    const contractInfo = await this.state.guarantorEscrow.getContractInfo();
    const offerInfo = await this.state.guarantorEscrow.getOfferInfo();
    const bidInfo = await this.state.guarantorEscrow.getBidInfo();
    const projectedSettlementInfo = await this.state.guarantorEscrow.getProjectedSettlementInfo();
    const settlementInfo = await this.state.guarantorEscrow.getSettlementInfo();
    const hasAsset = await this.state.guarantorEscrow.hasAsset();

    this.setState({...this.state, guarantorEscrowInfo: {isOwner, state, contractInfo, offerInfo, bidInfo, projectedSettlementInfo, settlementInfo, hasAsset}});
  }

  handleModalClose() {
    this.setState({...this.state, modalOpen: null});
    this.refreshState();
  }

  handleClick(modal: GuarantorViewModal) {
    this.setState({...this.state, modalOpen: modal});
  }

  render() {
    return (
      <Container component="main" maxWidth="sm">
        <Paper variant="outlined">
          <Typography component="h1" variant="h5" align="center">Guarantor</Typography>
          <ContractInfo context={this.props.context} contractInfo={this.state.guarantorEscrowInfo.contractInfo} />
          <OfferInfo context={this.props.context} offerInfo={this.state.guarantorEscrowInfo.offerInfo} />
          <BidInfo context={this.props.context} bidInfo={this.state.guarantorEscrowInfo.bidInfo} />
          <SettlementInfo context={this.props.context} settlementInfo={this.state.guarantorEscrowInfo.settlementInfo} />
          <Grid container spacing={1}>
            {GuarantorViewButtons.map((button) => {
              return (
                <Grid container item alignItems="center" justify="center" xs={12} spacing={1}>
                  <Grid item xs={6}>
                    <Button fullWidth size="medium" variant="contained" color="primary"
                     disabled={this.state.guarantorEscrowInfo.state === null ||
                               !this.state.guarantorEscrowInfo.isOwner ||
                               !button.isVisible(this.state.guarantorEscrowInfo.state)}
                     onClick={() => {this.handleClick(button.modal); }}>
                      {button.name}
                    </Button>
                  </Grid>
                  <Grid item xs={2}>
                    {this.state.guarantorEscrowInfo.state !== null && button.isComplete(this.state.guarantorEscrowInfo.state) &&
                     <CheckCircleIcon color="primary" />}
                  </Grid>
                </Grid>
              );
            })}
            {this.state.guarantorEscrowInfo.hasAsset &&
              <Grid container item alignItems="center" justify="center" xs={12} spacing={1}>
                <Grid item xs={6}>
                  <Button fullWidth size="medium" variant="contained" color="primary"
                   disabled={this.state.guarantorEscrowInfo.state === null ||
                             !this.state.guarantorEscrowInfo.isOwner ||
                             !this.state.guarantorEscrowInfo.hasAsset}
                   onClick={() => {this.handleClick(GuarantorViewModal.WithdrawNFT); }}>
                    Withdraw NFT
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  {this.state.guarantorEscrowInfo.state !== null && !this.state.guarantorEscrowInfo.hasAsset &&
                   <CheckCircleIcon color="primary" />}
                </Grid>
              </Grid>}
          </Grid>
        </Paper>
        {this.state.guarantorEscrow !== null && this.state.guarantorEscrowInfo.bidInfo !== null &&
          <DepositPaymentModal open={this.state.modalOpen == GuarantorViewModal.DepositPayment}
                               onClose={() => { this.handleModalClose(); }}
                               context={this.props.context}
                               guarantorEscrow={this.state.guarantorEscrow}
                               bidInfo={this.state.guarantorEscrowInfo.bidInfo} />}
        {this.state.guarantorEscrow !== null && this.state.guarantorEscrowInfo.offerInfo !== null && this.state.guarantorEscrowInfo.bidInfo !== null &&
          <CommitBidModal open={this.state.modalOpen == GuarantorViewModal.CommitBid}
                          onClose={() => { this.handleModalClose(); }}
                          context={this.props.context}
                          guarantorEscrow={this.state.guarantorEscrow}
                          offerInfo={this.state.guarantorEscrowInfo.offerInfo}
                          bidInfo={this.state.guarantorEscrowInfo.bidInfo} />}
        {this.state.guarantorEscrow !== null &&
          <ShowBidModal open={this.state.modalOpen == GuarantorViewModal.GetBid}
                        onClose={() => { this.handleModalClose(); }}
                        guarantorEscrow={this.state.guarantorEscrow} />}
        {this.state.guarantorEscrow !== null && this.state.guarantorEscrowInfo.projectedSettlementInfo !== null &&
          <SettleModal open={this.state.modalOpen == GuarantorViewModal.Settle}
                       onClose={() => { this.handleModalClose(); }}
                       context={this.props.context}
                       guarantorEscrow={this.state.guarantorEscrow}
                       settlementInfo={this.state.guarantorEscrowInfo.projectedSettlementInfo} />}
        {this.state.guarantorEscrow !== null && this.state.guarantorEscrowInfo.offerInfo !== null &&
          <WithdrawNFTModal open={this.state.modalOpen == GuarantorViewModal.WithdrawNFT}
                            onClose={() => { this.handleModalClose(); }}
                            context={this.props.context}
                            guarantorEscrow={this.state.guarantorEscrow}
                            offerInfo={this.state.guarantorEscrowInfo.offerInfo} />}
      </Container>
    );
  }
}

export const GuarantorView = withRouter(GuarantorViewComponent);
