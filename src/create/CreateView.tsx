import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { Panel, PanelWrapper } from '../components/Panel';
import { Typography } from '../components/Typography';
import {
  TextField,
  FieldLabel,
  RadioGroup,
} from '../components/FormFields/TextField';
import { Slider } from '../components/FormFields/Slider';
import { TextSelect } from '../components/FormFields/TextSelect';
import { Button } from '../components/Button';
import Grid from '@material-ui/core/Grid';

import * as ethers from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

import { AssetKind, ERC721Asset, ERC1155Asset } from '../../lib';
import { SellOrder, BuyOrder, serializeSellOrder } from '../../lib';
import { SellerEscrow, createAuctionSellOrder } from '../../lib';

import {
  EthereumContext,
  isWalletConnected,
  lookupTokenInfo,
} from '../helpers';

import {
  EthereumTransaction,
  EthereumTransactionStatus,
} from '../components/EthereumTransaction';

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
    tokenAddress: string | null;
    tokenId: string | null;
    tokenType: AssetKind;
    initialPrice: string | null;
    paymentTokenAddress: string | null;
    guarantorSellerSplitPercentage: number;
    expirationDays: string | null;
  };
  sellOrderParameters: SellOrderParameters | null;

  error?: string;
  transaction?: ethers.ContractTransaction;
  transactionStatus: EthereumTransactionStatus;
};

const PAYMENT_TOKEN_OPTIONS = [
  {
    value: '0xc778417e063141139fce010982780140aa0cd5ab',
    label: 'wETH',
  },
  {
    value: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    label: 'DAI',
  },
  {
    value: '0xeb8f08a975ab53e34d8a0330e0d34de942c95926',
    label: 'USDC',
  },
];

export class CreateViewComponent extends React.Component<
  CreateViewProps,
  CreateViewState
> {
  state: CreateViewState = {
    walletConnected: false,
    rawInputs: {
      tokenAddress: null,
      tokenId: null,
      tokenType: AssetKind.ERC721,
      initialPrice: null,
      paymentTokenAddress: '',
      guarantorSellerSplitPercentage: 25,
      expirationDays: '3',
    },
    sellOrderParameters: null,

    transactionStatus: EthereumTransactionStatus.None,
  };

  componentDidMount() {
    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      this.setState({ ...this.state, walletConnected: accounts.length > 0 });
    });

    this.checkWalletConnected();
    /* set the default payment token address in state.rawInputs.paymentTokenAddress */
    this.handlePaymentTokenAddressChange(PAYMENT_TOKEN_OPTIONS[0].value);
  }

  async checkWalletConnected() {
    const walletConnected = await isWalletConnected(
      this.props.context.provider
    );
    this.setState({ ...this.state, walletConnected });
  }

  async parseParameters(): Promise<SellOrderParameters> {
    if (!this.props.context.provider) throw new Error('Missing provider');

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

    if (this.state.rawInputs.paymentTokenAddress === null)
      throw new Error(`Invalid payment token address`);

    let paymentTokenAddress: string;
    try {
      paymentTokenAddress = ethers.utils.getAddress(
        this.state.rawInputs.paymentTokenAddress
      );
    } catch (err) {
      throw new Error(`Invalid payment token address: ${err.toString()}`);
    }

    const guarantorSellerSplitBasisPoints =
      this.state.rawInputs.guarantorSellerSplitPercentage * 100;

    const expirationDays: number = parseInt(
      this.state.rawInputs.expirationDays || ''
    );
    if (isNaN(expirationDays) || expirationDays < 1)
      throw new Error('Invalid expiration date.');

    const expirationTime: number =
      Math.floor(Date.now() / 1000) + 86400 * expirationDays;

    let decimals: number;
    try {
      const tokenInfo = await lookupTokenInfo(
        this.props.context.provider,
        paymentTokenAddress
      );
      decimals = tokenInfo.decimals;
    } catch (err) {
      throw new Error(`Unsupported payment token: ${err.toString()}`);
    }

    if (this.state.rawInputs.initialPrice === null)
      throw new Error(`Invalid initial price`);

    let initialPrice: BigNumber;
    try {
      initialPrice = ethers.utils.parseUnits(
        this.state.rawInputs.initialPrice,
        decimals
      );
    } catch (err) {
      throw new Error(`Invalid price: ${err.toString()}`);
    }

    let asset: ERC721Asset | ERC1155Asset;
    if (this.state.rawInputs.tokenType == AssetKind.ERC1155) {
      asset = {kind: AssetKind.ERC1155, tokenAddress, tokenId, tokenQuantity: ethers.BigNumber.from(1)};
    } else {
      asset = { kind: AssetKind.ERC721, tokenAddress, tokenId };
    }

    return {
      asset,
      initialPrice,
      paymentTokenAddress,
      guarantorSellerSplitBasisPoints,
      expirationTime,
    };
  }

  async handleClick() {
    if (!this.props.context.provider || !this.props.context.deployment) return;

    /* Parse inputs */
    let sellOrderParameters: SellOrderParameters;
    try {
      sellOrderParameters = await this.parseParameters();
    } catch (err) {
      this.setState({ ...this.state, error: err.toString() });
      return;
    }

    const signer = await this.props.context.provider.getSigner();

    /* Create escrow contract */
    let transaction: ethers.ContractTransaction;
    try {
      transaction = await SellerEscrow.deploy(
        signer,
        this.props.context.deployment,
        sellOrderParameters.guarantorSellerSplitBasisPoints,
        sellOrderParameters.expirationTime +
          this.props.context.deployment.exchangeMatchingLatency
      );
    } catch (err) {
      this.setState({ ...this.state, error: err.toString() });
      return;
    }

    this.setState({
      ...this.state,
      sellOrderParameters,
      transaction,
      error: undefined,
      transactionStatus: EthereumTransactionStatus.Pending,
    });
  }

  handleComplete(success: boolean) {
    this.setState({
      ...this.state,
      transactionStatus: success
        ? EthereumTransactionStatus.Success
        : EthereumTransactionStatus.Failure,
    });

    if (success) {
      this.redirectSeller();
    }
  }

  async redirectSeller() {
    if (
      !this.props.context.provider ||
      !this.props.context.deployment ||
      !this.state.transaction ||
      !this.state.sellOrderParameters
    )
      return;

    let sellerEscrowAddress: string;
    try {
      sellerEscrowAddress = await SellerEscrow.resolve(
        this.props.context.provider,
        this.props.context.deployment,
        this.state.transaction
      );
    } catch (err) {
      this.setState({
        ...this.state,
        error: `Error resolving contract address: ${err.toString()}`,
      });
      return;
    }

    /* Create sell order */
    const sellOrder = createAuctionSellOrder(
      this.props.context.deployment,
      sellerEscrowAddress,
      this.state.sellOrderParameters.asset,
      this.state.sellOrderParameters.paymentTokenAddress,
      this.state.sellOrderParameters.initialPrice,
      this.state.sellOrderParameters.expirationTime
    );

    /* Serialize orders */
    const sellOrderData = serializeSellOrder(sellOrder);

    /* Create URL */
    const urlSearchParams = new URLSearchParams({ sell: sellOrderData });
    const sellerURL =
      window.location.origin + '/#/seller/?' + urlSearchParams.toString();

    /* Redirect to URL */
    window.location.replace(sellerURL);
  }

  handleTokenAddressChange(value: string) {
    this.setState({
      ...this.state,
      rawInputs: { ...this.state.rawInputs, tokenAddress: value },
    });
  }

  handleTokenIdChange(value: string) {
    this.setState({
      ...this.state,
      rawInputs: { ...this.state.rawInputs, tokenId: value },
    });
  }

  handleTokenTypeChange(value: string) {
    this.setState({
      ...this.state,
      rawInputs: {
        ...this.state.rawInputs,
        tokenType: value == 'erc721' ? AssetKind.ERC721 : AssetKind.ERC1155,
      },
    });
  }

  handleInitialPriceChange(value: string) {
    this.setState({
      ...this.state,
      rawInputs: { ...this.state.rawInputs, initialPrice: value },
    });
  }

  handlePaymentTokenAddressChange(value: string) {
    this.setState({
      ...this.state,
      rawInputs: { ...this.state.rawInputs, paymentTokenAddress: value },
    });
  }

  handleGuarantorSellerSplitPercentageChange(value: number | number[]) {
    if (Array.isArray(value)) return;
    this.setState({
      ...this.state,
      rawInputs: {
        ...this.state.rawInputs,
        guarantorSellerSplitPercentage: value,
      },
    });
  }

  handleExpirationDaysChange(value: string) {
    this.setState({
      ...this.state,
      rawInputs: { ...this.state.rawInputs, expirationDays: value },
    });
  }

  render() {
    return (
      <Layout>
        <Panel>
          <PanelWrapper>
            <Typography component="h1" variant="h5" align="left">
              Sell
            </Typography>
            <Grid container spacing={2} alignItems="center" justify="center">
              <Grid item xs={12}>
                <FieldLabel for="tokenAddress" label="Token Address">
                  <TextField
                    name="tokenAddress"
                    onChange={(event: any) => {
                      this.handleTokenAddressChange(event.target.value);
                    }}
                  />
                </FieldLabel>
              </Grid>
              <Grid item xs={12}>
                <FieldLabel for="tokenId" label="Token Id">
                  <TextField
                    name="tokenId"
                    onChange={(event: any) => {
                      this.handleTokenIdChange(event.target.value);
                    }}
                  />
                </FieldLabel>
              </Grid>
              <Grid item xs={12}>
                <FieldLabel for="tokenType" label="Token Type">
                  <RadioGroup
                    name="tokenType"
                    value={
                      this.state.rawInputs.tokenType == AssetKind.ERC721
                        ? 'erc721'
                        : 'erc1155'
                    }
                    onChange={(event: any) => {
                      this.handleTokenTypeChange(event.target.value);
                    }}
                    values={[
                      { value: 'erc721', label: 'ERC721' },
                      { value: 'erc1155', label: 'ERC1155' },
                    ]}
                  ></RadioGroup>
                </FieldLabel>
              </Grid>
              <Grid item xs={12}>
                <FieldLabel for="initialPrice" label="Initial Price">
                  <TextSelect
                    name="initialPrice"
                    onChange={(event: any) => {
                      this.handleInitialPriceChange(event.target.value);
                    }}
                    selectName="paymentTokenAddress"
                    selectOnChange={(value: string) => {
                      this.handlePaymentTokenAddressChange(value);
                    }}
                    selectOptions={PAYMENT_TOKEN_OPTIONS}
                    selectDefaultValue={PAYMENT_TOKEN_OPTIONS[0]}
                  />
                </FieldLabel>
              </Grid>
              <Grid item xs={12}>
                <FieldLabel label="Guarantor-Seller Split Percentage">
                  <Slider
                    defaultValue={25}
                    step={1}
                    min={1}
                    max={99}
                    value={this.state.rawInputs.guarantorSellerSplitPercentage}
                    onChange={(value: number) => {
                      this.handleGuarantorSellerSplitPercentageChange(value);
                    }}
                  />
                </FieldLabel>
              </Grid>
              <Grid item xs={12}>
                <FieldLabel for="expirationDays" label="Auction Days">
                  <TextField
                    name="expirationDays"
                    type="text"
                    defaultValue="3"
                    min="1"
                    onChange={(event: any) => {
                      this.handleExpirationDaysChange(event.target.value);
                    }}
                  />
                </FieldLabel>
              </Grid>
              <Grid item xs={12}>
                {this.state.error && <b>{this.state.error}</b>}
                {this.state.transaction && (
                  <EthereumTransaction
                    context={this.props.context}
                    transaction={this.state.transaction}
                    onComplete={(success: boolean) => {
                      this.handleComplete(success);
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={() => {
                    this.handleClick();
                  }}
                  disabled={
                    !this.state.walletConnected ||
                    this.state.transactionStatus ==
                      EthereumTransactionStatus.Pending ||
                    this.state.transactionStatus ==
                      EthereumTransactionStatus.Success
                  }
                >
                  Create Offer
                </Button>
              </Grid>
            </Grid>
          </PanelWrapper>
        </Panel>
      </Layout>
    );
  }
}

export const CreateView = withRouter(CreateViewComponent);
