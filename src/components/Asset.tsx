import * as React from 'react';

import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { ERC721Asset, ERC1155Asset, AssetKind } from '../../lib';

import { EthereumContext, AssetInfo, lookupAssetInfo } from '../helpers';

import { Typography } from './Typography';
import { EthereumAddress } from './EthereumAddress';

/******************************************************************************/
/* Offer Info Component */
/******************************************************************************/

type AssetProps = {
  context: EthereumContext;
  asset: ERC721Asset | ERC1155Asset;
};

type AssetState = {
  assetInfo: AssetInfo | null;
};

export class Asset extends React.Component<AssetProps, AssetState> {
  state: AssetState = {
    assetInfo: null,
  };

  componentDidMount() {
    this.refreshAsset();
  }

  componentDidUpdate(prevProps: AssetProps) {
    if (prevProps.asset == this.props.asset) return;

    this.refreshAsset();
  }

  async refreshAsset() {
    if (!this.props.context.provider || !this.props.context.deployment) return;

    const assetInfo = await lookupAssetInfo(
      this.props.context.provider,
      this.props.context.deployment,
      this.props.asset
    );

    this.setState({ assetInfo });
  }

  render() {
    return (
      <div>
        <Typography variant="h1" subVariant="listHeading">
          NFT
        </Typography>
        <List>
          {this.state.assetInfo && (
            <ListItem>
              <Typography variant="h4" subVariant="listItemHeading">
                Name:{' '}
              </Typography>

              <Typography variant="p">{this.state.assetInfo.name}</Typography>
            </ListItem>
          )}
          {this.state.assetInfo && (
            <ListItem>
              <Typography variant="h4" subVariant="listItemHeading">
                Description:{' '}
              </Typography>

              <Typography variant="p">
                {this.state.assetInfo.description}
              </Typography>
            </ListItem>
          )}
          <ListItem>
            <Typography variant="h4" subVariant="listItemHeading">
              Token Address:{' '}
            </Typography>

            <EthereumAddress
              context={this.props.context}
              address={this.props.asset.tokenAddress}
              variant={'view'}
            />
          </ListItem>
          <ListItem>
            <Typography variant="h4" subVariant="listItemHeading">
              Token ID:
            </Typography>
            <Typography variant="p">
              {this.props.asset.tokenId.toString()}
            </Typography>
          </ListItem>
        </List>
        {this.state.assetInfo && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            <img
              src={this.state.assetInfo.imageURL}
              style={{ width: '75%', borderRadius: '10px' }}
            />
          </div>
        )}
      </div>
    );
  }
}
