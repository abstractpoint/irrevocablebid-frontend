import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { Panel, PanelWrapper } from '../components/Panel';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import Grid from '@material-ui/core/Grid';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { SellOrder, BuyOrder } from '../../lib';
import { validateSellerEscrow, validateGuarantorEscrow } from '../../lib';
import {
  SellerEscrow,
  SellerEscrowState,
  SellerEscrowContractInfo,
  SellerEscrowOfferInfo,
  SellerEscrowBidInfo,
  SellerEscrowSettlementInfo,
} from '../../lib';

import {
  EthereumContext,
  isWalletConnected,
  decodeSellOrder,
  decodeBuyOrder,
} from '../helpers';

import { ContractInfo } from './components/ContractInfo';
import { OfferInfo } from './components/OfferInfo';
import { BidInfo } from './components/BidInfo';
import { SettlementInfo } from './components/SettlementInfo';

import { DepositModal } from './modals/DepositModal';
import { ApproveGuarantorModal } from './modals/ApproveGuarantorModal';
import { GuarantorLinkModal } from './modals/GuarantorLinkModal';
import { StartAuctionModal } from './modals/StartAuctionModal';
import { FulfillAuctionModal } from './modals/FulfillAuctionModal';
import { SettleModal } from './modals/SettleModal';

/******************************************************************************/
/* Top-level Seller View Component */
/******************************************************************************/

enum SellerViewModal {
  Deposit,
  GuarantorLink,
  ApproveGuarantor,
  StartAuction,
  FulfillAuction,
  Settle,
}

const SellerViewButtons: {
  name: string;
  modal: SellerViewModal;
  isVisible: (state: SellerEscrowState) => boolean;
  isComplete: (state: SellerEscrowState) => boolean;
}[] = [
  {
    name: 'Deposit NFT',
    modal: SellerViewModal.Deposit,
    isVisible: (state: SellerEscrowState) => {
      return state == SellerEscrowState.Created;
    },
    isComplete: (state: SellerEscrowState) => {
      return state >= SellerEscrowState.Deposited;
    },
  },
  {
    name: 'Get Guarantor Link',
    modal: SellerViewModal.GuarantorLink,
    isVisible: (state: SellerEscrowState) => {
      return state == SellerEscrowState.Deposited;
    },
    isComplete: (state: SellerEscrowState) => {
      return state >= SellerEscrowState.Committed;
    },
  },
  {
    name: 'Approve Guarantor',
    modal: SellerViewModal.ApproveGuarantor,
    isVisible: (state: SellerEscrowState) => {
      return state == SellerEscrowState.Deposited;
    },
    isComplete: (state: SellerEscrowState) => {
      return state >= SellerEscrowState.Committed;
    },
  },
  {
    name: 'Start Auction',
    modal: SellerViewModal.StartAuction,
    isVisible: (state: SellerEscrowState) => {
      return state == SellerEscrowState.Committed;
    },
    isComplete: (state: SellerEscrowState) => {
      return state >= SellerEscrowState.Listed;
    },
  },
  {
    name: 'Fulfill Auction',
    modal: SellerViewModal.FulfillAuction,
    isVisible: (state: SellerEscrowState) => {
      return state == SellerEscrowState.Listed;
    },
    isComplete: (state: SellerEscrowState) => {
      return state >= SellerEscrowState.Executed;
    },
  },
  {
    name: 'Settle',
    modal: SellerViewModal.Settle,
    isVisible: (state: SellerEscrowState) => {
      return state == SellerEscrowState.Executed;
    },
    isComplete: (state: SellerEscrowState) => {
      return state >= SellerEscrowState.Settled;
    },
  },
];

type SellerViewProps = RouteComponentProps<{}> & {
  context: EthereumContext;
};

type SellerViewState = {
  sellerEscrow: SellerEscrow | null;
  sellerEscrowInfo: {
    isOwner: boolean;
    state: SellerEscrowState | null;
    contractInfo: SellerEscrowContractInfo | null;
    offerInfo: SellerEscrowOfferInfo | null;
    bidInfo: SellerEscrowBidInfo | null;
    projectedSettlementInfo: SellerEscrowSettlementInfo | null;
    settlementInfo: SellerEscrowSettlementInfo | null;
  };
  modalOpen: SellerViewModal | null;
};

class SellerViewComponent extends React.Component<
  SellerViewProps,
  SellerViewState
> {
  state: SellerViewState = {
    sellerEscrow: null,
    sellerEscrowInfo: {
      isOwner: false,
      state: null,
      contractInfo: null,
      offerInfo: null,
      bidInfo: null,
      projectedSettlementInfo: null,
      settlementInfo: null,
    },
    modalOpen: null,
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
    if (!this.props.context.provider || !this.props.context.deployment) return;

    let sellOrder: SellOrder | null = null;
    let buyOrder: BuyOrder | null = null;

    try {
      sellOrder = decodeSellOrder(this.props.context.deployment, sellOrderData);
    } catch (err) {
      alert(`Invalid sell order in seller link: ${err}`);
    }

    try {
      buyOrder = decodeBuyOrder(
        this.props.context.deployment,
        sellOrder,
        buyOrderData
      );
    } catch (err) {
      alert(`Invalid buy order in seller link: ${err}`);
    }

    if (sellOrder) {
      try {
        await validateSellerEscrow(
          this.props.context.provider,
          this.props.context.deployment,
          sellOrder
        );
      } catch (err) {
        alert(`Invalid seller escrow: ${err}`);
        sellOrder = null;
      }
    }

    if (buyOrder) {
      try {
        await validateGuarantorEscrow(
          this.props.context.provider,
          this.props.context.deployment,
          buyOrder
        );
      } catch (err) {
        alert(`Invalid guarantor escrow: ${err}`);
        buyOrder = null;
      }
    }

    if (!sellOrder) return;

    const sellerEscrow = new SellerEscrow(
      this.props.context.provider,
      this.props.context.deployment,
      sellOrder,
      buyOrder
    );
    this.setState({ ...this.state, sellerEscrow });

    await this.refreshState();
  }

  async refreshState() {
    if (!this.state.sellerEscrow) return;

    const isOwner =
      (await isWalletConnected(this.props.context.provider)) &&
      (await this.state.sellerEscrow.isOwner());
    const state = await this.state.sellerEscrow.getState();
    const contractInfo = await this.state.sellerEscrow.getContractInfo();
    const offerInfo = await this.state.sellerEscrow.getOfferInfo();
    const bidInfo = await this.state.sellerEscrow.getBidInfo();
    const projectedSettlementInfo =
      await this.state.sellerEscrow.getProjectedSettlementInfo();
    const settlementInfo = await this.state.sellerEscrow.getSettlementInfo();

    this.setState({
      ...this.state,
      sellerEscrowInfo: {
        isOwner,
        state,
        contractInfo,
        offerInfo,
        bidInfo,
        projectedSettlementInfo,
        settlementInfo,
      },
    });
  }

  handleModalClose() {
    this.setState({ ...this.state, modalOpen: null });
    this.refreshState();
  }

  handleClick(modal: SellerViewModal) {
    this.setState({ ...this.state, modalOpen: modal });
  }

  render() {
    return (
      <Layout>
        <Panel>
          <PanelWrapper>
            <Typography variant="h1" style={{ marginBottom: '20px' }}>
              Seller
            </Typography>
            <ContractInfo
              context={this.props.context}
              contractInfo={this.state.sellerEscrowInfo.contractInfo}
            />
            <OfferInfo
              context={this.props.context}
              offerInfo={this.state.sellerEscrowInfo.offerInfo}
            />
            <BidInfo
              context={this.props.context}
              bidInfo={this.state.sellerEscrowInfo.bidInfo}
            />
            <SettlementInfo
              context={this.props.context}
              settlementInfo={this.state.sellerEscrowInfo.settlementInfo}
            />
            <Grid container spacing={1}>
              {SellerViewButtons.map((button) => {
                const isDisabled =
                  this.state.sellerEscrowInfo.state === null ||
                  !this.state.sellerEscrowInfo.isOwner ||
                  !button.isVisible(this.state.sellerEscrowInfo.state);

                return (
                  <Grid
                    container
                    item
                    alignItems="center"
                    justify="center"
                    xs={12}
                    spacing={1}
                    key={button.name}
                  >
                    <Grid item xs={6}>
                      <Button
                        disabled={isDisabled}
                        onClick={() => {
                          this.handleClick(button.modal);
                        }}
                      >
                        {button.name}
                      </Button>
                    </Grid>
                    <Grid item xs={2}>
                      {this.state.sellerEscrowInfo.state !== null &&
                        button.isComplete(
                          this.state.sellerEscrowInfo.state
                        ) && (
                          <CheckCircleIcon
                            color="primary"
                            className="CheckCircleIcon__ActionOrange"
                          />
                        )}
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </PanelWrapper>
        </Panel>
        {this.state.sellerEscrow !== null &&
          this.state.sellerEscrowInfo.offerInfo !== null && (
            <DepositModal
              open={this.state.modalOpen == SellerViewModal.Deposit}
              onClose={() => {
                this.handleModalClose();
              }}
              context={this.props.context}
              sellerEscrow={this.state.sellerEscrow}
              offerInfo={this.state.sellerEscrowInfo.offerInfo}
            />
          )}
        {this.state.sellerEscrow !== null && (
          <GuarantorLinkModal
            open={this.state.modalOpen == SellerViewModal.GuarantorLink}
            onClose={() => {
              this.handleModalClose();
            }}
            sellerEscrow={this.state.sellerEscrow}
          />
        )}
        {this.state.sellerEscrow !== null && (
          <ApproveGuarantorModal
            open={this.state.modalOpen == SellerViewModal.ApproveGuarantor}
            onClose={() => {
              this.handleModalClose();
            }}
            context={this.props.context}
            sellerEscrow={this.state.sellerEscrow}
          />
        )}
        {this.state.sellerEscrow !== null &&
          this.state.sellerEscrowInfo.offerInfo &&
          this.state.sellerEscrowInfo.bidInfo && (
            <StartAuctionModal
              open={this.state.modalOpen == SellerViewModal.StartAuction}
              onClose={() => {
                this.handleModalClose();
              }}
              context={this.props.context}
              sellerEscrow={this.state.sellerEscrow}
              offerInfo={this.state.sellerEscrowInfo.offerInfo}
              bidInfo={this.state.sellerEscrowInfo.bidInfo}
            />
          )}
        {this.state.sellerEscrow !== null && (
          <FulfillAuctionModal
            open={this.state.modalOpen == SellerViewModal.FulfillAuction}
            onClose={() => {
              this.handleModalClose();
            }}
            context={this.props.context}
            sellerEscrow={this.state.sellerEscrow}
          />
        )}
        {this.state.sellerEscrow !== null &&
          this.state.sellerEscrowInfo.projectedSettlementInfo !== null && (
            <SettleModal
              open={this.state.modalOpen == SellerViewModal.Settle}
              onClose={() => {
                this.handleModalClose();
              }}
              context={this.props.context}
              sellerEscrow={this.state.sellerEscrow}
              settlementInfo={
                this.state.sellerEscrowInfo.projectedSettlementInfo
              }
            />
          )}
      </Layout>
    );
  }
}

export const SellerView = withRouter(SellerViewComponent);
