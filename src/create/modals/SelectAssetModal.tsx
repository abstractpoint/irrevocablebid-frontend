import * as React from 'react';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { DialogStyled } from '../../components/DialogStyled';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import * as ethers from 'ethers';

import { AssetKind, ERC721Asset, ERC1155Asset } from '../../../lib';

import { EthereumContext } from '../../helpers';

import { ProgressIndicator } from '../../components/ProgressIndicator';

/******************************************************************************/
/* Select Asset Modal Component */
/******************************************************************************/

type AssetCandidate = {
  name: string;
  description: string;
  imageURL: string;
  tokenAddress: string;
  tokenId: string;
  tokenType: AssetKind;
};

type SelectAssetModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: ERC721Asset | ERC1155Asset | null) => void;
  context: EthereumContext;
};

type SelectAssetModalState = {
  loading: boolean;
  candidates: AssetCandidate[];
  index: number | null;
};

export class SelectAssetModal extends React.Component<
  SelectAssetModalProps,
  SelectAssetModalState
> {
  state: SelectAssetModalState = {
    loading: false,
    candidates: [],
    index: null,
  };

  async refreshAssets() {
    if (!this.props.context.deployment || !this.props.context.provider) return;

    const accounts = await this.props.context.provider.listAccounts();
    if (!accounts.length) return;

    const endpointURL = `${this.props.context.deployment.openseaApiBaseURL}/api/v1/assets?owner=${accounts[0]}&limit=50`;

    let response: Response;
    try {
      response = await fetch(endpointURL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (err) {
      console.error('Error fetching assets:', err);
      return;
    }

    if (response.status != 200) {
      console.error(`Error fetching assets: ${response.statusText}`);
      return;
    }

    const responseObject: any = await response.json();

    const candidates: AssetCandidate[] = [];

    for (const asset of responseObject.assets) {
      if (
        !asset.asset_contract ||
        (asset.asset_contract.schema_name != 'ERC721' &&
          asset.asset_contract.schema_name != 'ERC1155')
      )
        continue;

      let candidate: AssetCandidate;
      try {
        candidate = {
          name: asset.name,
          description: asset.description,
          imageURL: asset.image_preview_url,
          tokenAddress: asset.asset_contract.address,
          tokenId: asset.token_id,
          tokenType:
            asset.asset_contract.schema_name == 'ERC1155'
              ? AssetKind.ERC1155
              : AssetKind.ERC721,
        };
      } catch (err) {
        console.error('Error decoding asset:', asset);
        continue;
      }

      candidates.push(candidate);
    }

    this.setState({ candidates, loading: false });
  }

  handleOnEnter() {
    this.setState({ loading: true });

    this.refreshAssets();
  }

  handleSelect(index: number) {
    this.setState({ index });
  }

  async handleClick() {
    if (this.state.index === null) return;

    const candidate = this.state.candidates[this.state.index];

    let asset: ERC721Asset | ERC1155Asset;
    if (candidate.tokenType == AssetKind.ERC1155) {
      asset = {
        kind: AssetKind.ERC1155,
        tokenAddress: candidate.tokenAddress,
        tokenId: ethers.BigNumber.from(candidate.tokenId),
        tokenQuantity: ethers.BigNumber.from(1),
      };
    } else {
      asset = {
        kind: AssetKind.ERC721,
        tokenAddress: candidate.tokenAddress,
        tokenId: ethers.BigNumber.from(candidate.tokenId),
      };
    }

    this.props.onSelect(asset);
    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onEnter={() => {
          this.handleOnEnter();
        }}
        onClose={this.props.onClose}
        aria-labelledby="simple-modal-title"
        fullWidth={true}
      >
        <DialogStyled>
          <DialogTitle id="simple-modal-title">Select NFT</DialogTitle>
          <DialogContent>
            {this.state.loading ? (
              <ProgressIndicator />
            ) : (
              <List>
                {this.state.candidates.map((candidate, index) => {
                  return (
                    <ListItem
                      key={index}
                      role={undefined}
                      dense
                      button
                      selected={this.state.index == index}
                      onClick={() => {
                        this.handleSelect(index);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={candidate.imageURL} variant="square" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={candidate.name}
                        secondary={candidate.description}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="text"
              size="small"
              onClick={() => {
                this.props.onClose();
              }}
            >
              Close
            </Button>
            <Button
              color="primary"
              size="small"
              onClick={() => {
                this.handleClick();
              }}
              disabled={this.state.index === null}
            >
              Select
            </Button>
          </DialogActions>
        </DialogStyled>
      </Dialog>
    );
  }
}
