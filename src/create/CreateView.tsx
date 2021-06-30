import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Slider from '@material-ui/core/Slider';
import { DateTimePicker } from "@material-ui/pickers";

import * as ethers from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

import { AssetKind, ERC721Asset, ERC1155Asset } from "../../lib";
import { SellOrder, BuyOrder, serializeSellOrder } from "../../lib";
import { SellerEscrow, createAuctionSellOrder } from "../../lib";

import { EthereumContext, isWalletConnected, lookupTokenInfo } from "../helpers";

import { EthereumTransaction, EthereumTransactionStatus } from "../components/EthereumTransaction";

/******************************************************************************/
/* Top-level Create View Component */
/******************************************************************************/

type SellOrderParameters = {
  asset: ERC721Asset | ERC1155Asset;
  initialPrice: BigNumber;
  paymentTokenAddress: string;
  guarantorSellerSplitBasisPoints: number;
  expirationTime: number;
};

type CreateViewProps = RouteComponentProps<{}> & {
  context: EthereumContext;
};

type CreateViewState = {
  walletConnected: boolean;
  rawInputs: {
    tokenAddress: string | null,
    tokenId: string | null;
    tokenType: AssetKind;
    tokenQuantity: string | null;
    initialPrice: string | null;
    paymentTokenAddress: string | null;
    guarantorSellerSplitPercentage: number;
    expirationTime: Date | null;
  };
  sellOrderParameters: SellOrderParameters | null;

  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

export class CreateViewComponent extends React.Component<CreateViewProps, CreateViewState> {
  state: CreateViewState = {
    walletConnected: false,
    rawInputs: {
      tokenAddress: null,
      tokenId: null,
      tokenType: AssetKind.ERC721,
      tokenQuantity: null,
      initialPrice: null,
      paymentTokenAddress: "",
      guarantorSellerSplitPercentage: 25,
      expirationTime: null,
    },
    sellOrderParameters: null,

    transactionStatus: EthereumTransactionStatus.None,
  };

  componentDidMount() {
    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      this.setState({...this.state, walletConnected: accounts.length > 0});
    });

    this.checkWalletConnected();
  }

  async checkWalletConnected() {
    const walletConnected = await isWalletConnected(this.props.context.provider);
    this.setState({...this.state, walletConnected});
  }

  async parseParameters(): Promise<SellOrderParameters> {
    if (!this.props.context.provider)
      throw new Error('Missing provider');

    if (this.state.rawInputs.tokenAddress === null)
      throw new Error(`Invalid token address`);

    let tokenAddress: string;
    try {
      tokenAddress = ethers.utils.getAddress(this.state.rawInputs.tokenAddress);
    } catch (err) {
      throw new Error(`Invalid token address: ${err.toString()}`);
    }

    let tokenId: BigNumber;
    try {
      tokenId = ethers.BigNumber.from(this.state.rawInputs.tokenId);
    } catch (err) {
      throw new Error(`Invalid token id: ${err.toString()}`);
    }

    let tokenQuantity: BigNumber | null;
    try {
      tokenQuantity = this.state.rawInputs.tokenType == AssetKind.ERC1155 ? ethers.BigNumber.from(this.state.rawInputs.tokenQuantity) : null;
    } catch (err) {
      throw new Error(`Invalid token quantity: ${err.toString()}`);
    }

    if (this.state.rawInputs.paymentTokenAddress === null)
      throw new Error(`Invalid payment token address`);

    let paymentTokenAddress: string;
    try {
      paymentTokenAddress = ethers.utils.getAddress(this.state.rawInputs.paymentTokenAddress);
    } catch (err) {
      throw new Error(`Invalid payment token address: ${err.toString()}`);
    }

    const guarantorSellerSplitBasisPoints = this.state.rawInputs.guarantorSellerSplitPercentage * 100;

    if (this.state.rawInputs.expirationTime === null)
      throw new Error("Invalid expiration date.");

    const expirationTime: number = this.state.rawInputs.expirationTime.getTime() / 1000;

    let decimals: number;
    try {
      const tokenInfo = await lookupTokenInfo(this.props.context.provider, paymentTokenAddress);
      decimals = tokenInfo.decimals;
    } catch (err) {
      throw new Error(`Unsupported payment token: ${err.toString()}`);
    }

    if (this.state.rawInputs.initialPrice === null)
      throw new Error(`Invalid initial price`);

    let initialPrice: BigNumber;
    try {
      initialPrice = ethers.utils.parseUnits(this.state.rawInputs.initialPrice, decimals);
    } catch (err) {
      throw new Error(`Invalid price: ${err.toString()}`);
    }

    let asset: ERC721Asset | ERC1155Asset;
    if (this.state.rawInputs.tokenType == AssetKind.ERC1155) {
      asset = {kind: AssetKind.ERC1155, tokenAddress, tokenId, tokenQuantity: tokenQuantity!};
    } else {
      asset = {kind: AssetKind.ERC721, tokenAddress, tokenId};
    }

    return {asset, initialPrice, paymentTokenAddress, guarantorSellerSplitBasisPoints, expirationTime};
  }

  async handleClick() {
    if (!this.props.context.provider || !this.props.context.deployment)
      return;

    /* Parse inputs */
    let sellOrderParameters: SellOrderParameters;
    try {
      sellOrderParameters = await this.parseParameters();
    } catch (err) {
      this.setState({...this.state, error: err.toString()});
      return;
    }

    const signer = await this.props.context.provider.getSigner();

    /* Create escrow contract */
    let transaction: ethers.ContractTransaction;
    try {
      transaction = await SellerEscrow.deploy(signer, this.props.context.deployment,
                                              sellOrderParameters.guarantorSellerSplitBasisPoints,
                                              sellOrderParameters.expirationTime + this.props.context.deployment.exchangeMatchingLatency);
    } catch (err) {
      this.setState({...this.state, error: err.toString()});
      return;
    }

    this.setState({...this.state, sellOrderParameters, transaction, error: undefined, transactionStatus: EthereumTransactionStatus.Pending});
  }

  handleComplete(success: boolean) {
    this.setState({...this.state, transactionStatus: success ? EthereumTransactionStatus.Success : EthereumTransactionStatus.Failure});

    if (success) {
      this.redirectSeller();
    }
  }

  async redirectSeller() {
    if (!this.props.context.provider || !this.props.context.deployment || !this.state.transaction || !this.state.sellOrderParameters)
      return;

    let sellerEscrowAddress: string
    try {
      sellerEscrowAddress = await SellerEscrow.resolve(this.props.context.provider, this.props.context.deployment,
                                                       this.state.transaction);
    } catch (err) {
      this.setState({...this.state, error: `Error resolving contract address: ${err.toString()}`});
      return;
    }

    /* Create sell order */
    const sellOrder = createAuctionSellOrder(this.props.context.deployment, sellerEscrowAddress,
                                             this.state.sellOrderParameters.asset,
                                             this.state.sellOrderParameters.paymentTokenAddress,
                                             this.state.sellOrderParameters.initialPrice,
                                             this.state.sellOrderParameters.expirationTime);

    /* Serialize orders */
    const sellOrderData = serializeSellOrder(sellOrder);

    /* Create URL */
    const urlSearchParams = new URLSearchParams({sell: sellOrderData});
    const sellerURL = window.location.origin + "/#/seller/?" + urlSearchParams.toString();

    /* Redirect to URL */
    window.location.replace(sellerURL);
  }

  handleTokenAddressChange(value: string) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, tokenAddress: value}});
  }

  handleTokenIdChange(value: string) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, tokenId: value}});
  }

  handleTokenTypeChange(value: string) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, tokenType: value == "erc721" ? AssetKind.ERC721 : AssetKind.ERC1155}});
  }

  handleTokenQuantityChange(value: string) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, tokenQuantity: value}});
  }

  handleInitialPriceChange(value: string) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, initialPrice: value}});
  }

  handlePaymentTokenAddressChange(value: string) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, paymentTokenAddress: value}});
  }

  handleGuarantorSellerSplitPercentageChange(value: number | number[]) {
    if (Array.isArray(value))
      return;
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, guarantorSellerSplitPercentage: value}});
  }

  handleExpirationDateChange(value: Date | null) {
    this.setState({...this.state, rawInputs: {...this.state.rawInputs, expirationTime: value}});
  }

  render() {
    return (
      <Container component="main" maxWidth="sm">
        <Paper variant="outlined">
          <Typography component="h1" variant="h5" align="center">Sell</Typography>
          <Grid container xs={12} spacing={2} alignItems="center" justify="center">
            <Grid item xs={12}>
              <TextField name="tokenAddress" variant="outlined" fullWidth label="Token Address" autoFocus
                         onChange={(event: any) => { this.handleTokenAddressChange(event.target.value); }} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="tokenId" variant="outlined" fullWidth label="Token ID"
                         onChange={(event: any) => { this.handleTokenIdChange(event.target.value); }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Token Type</FormLabel>
                <RadioGroup aria-label="tokenType" name="tokenType"
                            value={this.state.rawInputs.tokenType == AssetKind.ERC721 ? "erc721" : "erc1155"}
                            onChange={(event: any) => { this.handleTokenTypeChange(event.target.value); }} >
                  <FormControlLabel value="erc721" control={<Radio />} label="ERC721" />
                  <FormControlLabel value="erc1155" control={<Radio />} label="ERC1155" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {this.state.rawInputs.tokenType == AssetKind.ERC1155 &&
              <Grid item xs={12}>
                  <TextField name="tokenQuantity" variant="outlined" fullWidth label="Token Quantity"
                             onChange={(event: any) => { this.handleTokenQuantityChange(event.target.value); }} />
              </Grid>}
            <Grid item xs={12}>
              <TextField name="initialPrice" variant="outlined" fullWidth label="Initial Price"
                         onChange={(event: any) => { this.handleInitialPriceChange(event.target.value); }} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="paymentTokenAddress" variant="outlined" fullWidth label="Payment Token Address" autoFocus
                         onChange={(event: any) => { this.handlePaymentTokenAddressChange(event.target.value); }} />
            </Grid>
            <Grid item xs={12}>
              <Typography id="guarantor-seller-split-label" gutterBottom>Guarantor-Seller Split Percentage</Typography>
              <Slider defaultValue={25} aria-labelledby="guarantor-seller-split-label" step={1} marks
                      min={1} max={99} valueLabelDisplay="auto"
                      onChange={(event: object, value: number | number[]) => { this.handleGuarantorSellerSplitPercentageChange(value); }} />
            </Grid>
            <Grid item xs={12}>
              <DateTimePicker fullWidth label="Expiration Date" inputVariant="outlined"
                              value={this.state.rawInputs.expirationTime}
                              onChange={(value: Date | null) => { this.handleExpirationDateChange(value); }} />
            </Grid>
            <Grid item xs={12}>
              {this.state.error && <b>{this.state.error}</b>}
              {this.state.transaction && <EthereumTransaction context={this.props.context} transaction={this.state.transaction}
                                                              onComplete={(success: boolean) => { this.handleComplete(success); }} />}
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth size="medium" variant="contained" color="primary"
                      onClick={() => { this.handleClick(); }}
                      disabled={!this.state.walletConnected ||
                                this.state.transactionStatus == EthereumTransactionStatus.Pending ||
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

export const CreateView = withRouter(CreateViewComponent);
