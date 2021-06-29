import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import * as ethers from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

import { SellOrder, BuyOrder } from "../../lib";
import { validateSellerEscrow } from "../../lib";
import { createMatchingBuyOrder, serializeSellOrder, serializeBuyOrder } from "../../lib";
import { SellerEscrow, SellerEscrowContractInfo, SellerEscrowOfferInfo } from "../../lib";
import { GuarantorEscrow } from "../../lib";

import { EthereumContext, lookupTokenInfo, decodeSellOrder } from "../helpers";
import { EthereumTransaction, EthereumTransactionStatus } from "../components/EthereumTransaction";

import { OfferInfo } from "./components/OfferInfo";

/******************************************************************************/
/* Top-level Guarantee View Component */
/******************************************************************************/

type GuaranteeViewProps = RouteComponentProps<{}> & {
  context: EthereumContext;
};

type GuaranteeViewState = {
  sellOrder: SellOrder | null;
  sellerEscrowInfo: {
    contractInfo: SellerEscrowContractInfo | null;
    offerInfo: SellerEscrowOfferInfo | null;
  };
  guaranteedPriceString: string | null;
  guaranteedPrice: BigNumber | null;

  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class GuaranteeViewComponent extends React.Component<GuaranteeViewProps, GuaranteeViewState> {
  state: GuaranteeViewState = {
    sellOrder: null,
    sellerEscrowInfo: {
      contractInfo: null,
      offerInfo: null,
    },
    guaranteedPriceString: null,
    guaranteedPrice: null,
    transactionStatus: EthereumTransactionStatus.None,
  };

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const sellOrderData = params.get('sell');
    this.instantiate(sellOrderData);
  }

  async instantiate(sellOrderData: string | null) {
    if (!this.props.context.provider || !this.props.context.deployment)
      return;

    let sellOrder: SellOrder | null = null;

    try {
      sellOrder = decodeSellOrder(this.props.context.deployment, sellOrderData);
    } catch (err) {
      alert(`Invalid sell order in seller link: ${err}`);
    }

    if (sellOrder) {
      try {
        await validateSellerEscrow(this.props.context.provider, this.props.context.deployment, sellOrder);
      } catch(err) {
        alert(`Invalid seller escrow: ${err}`);
        sellOrder = null;
      }
    }

    if (!sellOrder)
      return;

    const sellerEscrow = new SellerEscrow(this.props.context.provider, this.props.context.deployment, sellOrder, null);
    const contractInfo = await sellerEscrow.getContractInfo();
    const offerInfo = await sellerEscrow.getOfferInfo();

    this.setState({...this.state, sellOrder, sellerEscrowInfo: {contractInfo, offerInfo}});
  }

  handleChange(value: string) {
    this.setState({...this.state, guaranteedPriceString: value});
  }

  async handleClick() {
    if (!this.props.context.provider || !this.props.context.deployment ||
        this.state.sellOrder === null || !this.state.guaranteedPriceString)
      return;

    /* Look up token decimals */
    let decimals: number;
    try {
      const tokenInfo = await lookupTokenInfo(this.props.context.provider, this.state.sellOrder.paymentToken);
      decimals = tokenInfo.decimals;
    } catch (err) {
      this.setState({...this.state, error: `Unsupported payment token: ${err.toString()}`});
      return;
    }

    /* Parse guaranteed price */
    let guaranteedPrice: BigNumber;
    try {
      guaranteedPrice = ethers.utils.parseUnits(this.state.guaranteedPriceString, decimals);
    } catch (err) {
      this.setState({...this.state, error: `Invalid price: ${err.toString()}`});
      return;
    }

    const signer = await this.props.context.provider.getSigner();

    /* Create escrow contract */
    let transaction: ethers.ContractTransaction;
    try {
      transaction = await GuarantorEscrow.deploy(signer, this.props.context.deployment,
                                                 this.state.sellOrder.expirationTime.toNumber());
    } catch (err) {
      this.setState({...this.state, error: (err instanceof Object) ? `Error: ${err.message}` : err});
      return;
    }

    this.setState({...this.state, guaranteedPrice, transaction, error: undefined, transactionStatus: EthereumTransactionStatus.Pending});
  }

  handleComplete(success: boolean) {
    this.setState({...this.state, transactionStatus: success ? EthereumTransactionStatus.Success : EthereumTransactionStatus.Failure});

    if (success) {
      this.redirectGuarantor();
    }
  }

  async redirectGuarantor() {
    if (!this.props.context.provider || !this.props.context.deployment ||
        !this.state.guaranteedPrice || !this.state.transaction || !this.state.sellOrder)
      return;

    let guarantorEscrowAddress: string
    try {
      guarantorEscrowAddress = await GuarantorEscrow.resolve(this.props.context.provider, this.props.context.deployment,
                                                             this.state.transaction);
    } catch (err) {
      this.setState({...this.state, error: `Error resolving contract address: ${err.toString()}`});
      return;
    }

    /* Create matching buy order */
    const buyOrder = createMatchingBuyOrder(this.props.context.deployment, guarantorEscrowAddress, this.state.sellOrder,
                                            this.state.guaranteedPrice);

    /* Serialize orders */
    const sellOrderData = serializeSellOrder(this.state.sellOrder);
    const buyOrderData = serializeBuyOrder(buyOrder);

    /* Create URL */
    const urlSearchParams = new URLSearchParams({sell: sellOrderData, buy: buyOrderData});
    const guarantorURL = window.location.origin + "/#/guarantor/?" + urlSearchParams.toString();

    /* Redirect to URL */
    window.location.replace(guarantorURL);
  }

  render() {
    return (
      <Container component="main" maxWidth="sm">
        <Paper variant="outlined">
          <Typography component="h1" variant="h5" align="center">Guarantee</Typography>
          <OfferInfo context={this.props.context} contractInfo={this.state.sellerEscrowInfo.contractInfo} offerInfo={this.state.sellerEscrowInfo.offerInfo} />
          {this.state.error && <b>{this.state.error}</b>}
          {this.state.transaction && <EthereumTransaction context={this.props.context} transaction={this.state.transaction}
                                                          onComplete={(success: boolean) => { this.handleComplete(success); }} />}
          <Grid container xs={12} spacing={1} alignItems="center" justify="center">
            <Grid item xs={12}>
              <TextField name="price" variant="outlined" fullWidth label="Guaranteed Price" autoFocus
                         onChange={(event: any) => { this.handleChange(event.target.value); }} />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth color="primary" variant="contained"
                      onClick={() => { this.handleClick(); }}
                      disabled={this.state.transactionStatus == EthereumTransactionStatus.Pending ||
                                this.state.transactionStatus == EthereumTransactionStatus.Success} autoFocus>
                Create
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }
}

export const GuaranteeView = withRouter(GuaranteeViewComponent);
