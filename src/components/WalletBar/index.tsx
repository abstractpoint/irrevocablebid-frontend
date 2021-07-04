import * as React from 'react';
import styled from 'styled-components';

import logo from '../../assets/irrevocable-logo.svg';

import { Button } from '../Button';
import { EthereumContext } from '../../helpers';
import { EthereumAddress } from '../EthereumAddress';

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

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 60px;
  height: 90px;
  margin-bottom: 20px;
`;

const Logo = styled.div`
  background-image: url(${(props: { bg: string }) => props.bg});
  height: 50px;
  width: 200px;
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
`;

const Wallet = styled.div`
  display: flex;
`;

// const Button = styled.button`
//   background-color: var(--action-orange);
//   width: 284px;
//   height: 81px;
//   border-radius: 26px;
//   box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
// `;

export class WalletBar extends React.Component<WalletBarProps, WalletBarState> {
  state: WalletBarState = {
    accountRequest: null,
    accountAddress: null,
  };

  componentDidMount() {
    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      this.setState({
        ...this.state,
        accountRequest: null,
        accountAddress: accounts.length > 0 ? accounts[0] : null,
      });
    });

    this.checkConnected();
  }

  async checkConnected() {
    if (!this.props.context.provider) return;

    const accounts = await this.props.context.provider.listAccounts();
    this.setState({
      ...this.state,
      accountRequest: null,
      accountAddress: accounts.length > 0 ? accounts[0] : null,
    });
  }

  async requestAccounts() {
    const accountRequest: Promise<string[]> = (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    });
    this.setState({ ...this.state, accountRequest, accountAddress: null });

    const accounts = await accountRequest;
    this.setState({
      ...this.state,
      accountRequest: null,
      accountAddress: accounts.length > 0 ? accounts[0] : null,
    });
  }

  render() {
    return (
      <Container>
        <Logo bg={logo} />
        <Wallet>
          <div style={{ flex: '1 0 0' }} />
          {this.state.accountAddress === null ? (
            <Button
              onClick={() => {
                this.requestAccounts();
              }}
              disabled={this.state.accountRequest !== null}
              variant="primary"
            >
              Connect Wallet
            </Button>
          ) : (
            <EthereumAddress
              context={this.props.context}
              address={this.state.accountAddress}
            />
          )}
        </Wallet>
      </Container>
    );
  }
}
