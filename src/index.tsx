import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { HashRouter, Switch, Route } from 'react-router-dom';

import * as ethers from 'ethers';

import { WalletBar } from './components/WalletBar';
import { Background } from './components/Background';
import { CreateView } from './create/CreateView';
import { GuaranteeView } from './guarantee/GuaranteeView';
import { SellerView } from './seller/SellerView';
import { GuarantorView } from './guarantor/GuarantorView';
import GlobalStyle from './styles/global';

import { EthereumContext } from './helpers';

import { Deployments } from '../lib';

/******************************************************************************/
/* Top-level Seller View App */
/******************************************************************************/

type AppState = {
  context: EthereumContext;
};

class App extends React.Component<{}, AppState> {
  state: AppState = {
    context: {
      provider: undefined,
      deployment: undefined,
    },
  };

  componentDidMount() {
    this.createEthereumContext();
  }

  async createEthereumContext() {
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    const network = await provider.getNetwork();
    const deployment = Deployments[network.chainId];

    this.setState({ ...this.state, context: { provider, deployment } });

    (window as any).ethereum.on('chainChanged', (chainId: string) =>
      window.location.reload()
    );
  }

  render() {
    if (this.state.context.provider === undefined) {
      return <p>This DAPP requires a browser wallet.</p>;
    }

    return (
      <>
        <GlobalStyle />
        <Background>
          <WalletBar context={this.state.context} />
          <HashRouter>
            <Switch>
              <Route
                exact
                path="/"
                render={(props) => (
                  <CreateView {...props} context={this.state.context} />
                )}
              />
              <Route
                path="/guarantee/"
                render={(props) => (
                  <GuaranteeView {...props} context={this.state.context} />
                )}
              />
              <Route
                path="/seller/"
                render={(props) => (
                  <SellerView {...props} context={this.state.context} />
                )}
              />
              <Route
                path="/guarantor/"
                render={(props) => (
                  <GuarantorView {...props} context={this.state.context} />
                )}
              />
            </Switch>
          </HashRouter>
        </Background>
      </>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
