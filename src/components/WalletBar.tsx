import * as React from "react";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

import { EthereumContext } from "../helpers";
import { EthereumAddress } from "./EthereumAddress";

/******************************************************************************/
/* Wallet Bar Component */
/******************************************************************************/

type WalletBarProps = {
  context: EthereumContext;
};

type WalletBarState = {
  accountRequest: Promise<string[]> | null;
  accountAddress: string | null;
};

export class WalletBar extends React.Component<WalletBarProps, WalletBarState> {
  state: WalletBarState = {
    accountRequest: null,
    accountAddress: null
  };

  componentDidMount() {
    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      this.setState({...this.state, accountRequest: null, accountAddress: accounts.length > 0 ? accounts[0] : null});
    });

    this.checkConnected();
  }

  async checkConnected() {
    if (!this.props.context.provider)
      return;

    const accounts = await this.props.context.provider.listAccounts();
    this.setState({...this.state, accountRequest: null, accountAddress: accounts.length > 0 ? accounts[0] : null});
  }

  async requestAccounts() {
    const accountRequest: Promise<string[]> = (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    this.setState({...this.state, accountRequest, accountAddress: null});

    const accounts = await accountRequest;
    this.setState({...this.state, accountRequest: null, accountAddress: accounts.length > 0 ? accounts[0] : null});
  }

  render() {
    return (
      <AppBar position="static">
        <Toolbar>
          <div style={{flex: '1 0 0'}} />
          {this.state.accountAddress === null ?
            <Button onClick={() => { this.requestAccounts(); }}
                    disabled={this.state.accountRequest !== null}
                    color="inherit">
              Connect Wallet
            </Button> :
            <EthereumAddress context={this.props.context} address={this.state.accountAddress} />}
        </Toolbar>
      </AppBar>
    );
  }
}
