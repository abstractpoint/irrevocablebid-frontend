import * as React from "react";
import * as ReactDOM from "react-dom";

import { HashRouter, Switch, Route } from "react-router-dom";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import * as ethers from "ethers";

import { CreateView } from "./create/CreateView";
import { GuaranteeView } from "./guarantee/GuaranteeView";
import { SellerView } from "./seller/SellerView";
import { GuarantorView } from "./guarantor/GuarantorView";

import { EthereumContext } from "./helpers";

import { Deployments } from "../lib";

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
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const network = await provider.getNetwork();
    const deployment = Deployments[network.chainId];

    /* FIXME should be a connect wallet button */
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

    this.setState({context: {provider, deployment}});
  }

  render() {
    if (this.state.context.provider === undefined) {
      return (
        <div/>
      );
    }

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <HashRouter>
          <Switch>
            <Route exact path="/" render={(props) => (
              <CreateView {...props} context={this.state.context} />
            )}/>
            <Route path="/guarantee/" render={(props) => (
              <GuaranteeView {...props} context={this.state.context} />
            )}/>
            <Route path="/seller/" render={(props) => (
              <SellerView {...props} context={this.state.context} />
            )}/>
            <Route path="/guarantor/" render={(props) => (
              <GuarantorView {...props} context={this.state.context} />
            )}/>
          </Switch>
        </HashRouter>
      </MuiPickersUtilsProvider>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
