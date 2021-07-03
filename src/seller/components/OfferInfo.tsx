import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { AssetKind } from '../../../lib';
import { SellerEscrowOfferInfo } from '../../../lib';

import { EthereumContext } from '../../helpers';
import { EthereumAddress } from '../../components/EthereumAddress';
import { TokenAmount } from '../../components/TokenAmount';

/******************************************************************************/
/* Offer Info Component */
/******************************************************************************/

type OfferInfoProps = {
  context: EthereumContext;
  offerInfo: SellerEscrowOfferInfo | null;
};

export function OfferInfo(props: OfferInfoProps) {
  if (!props.offerInfo) {
    return (
      <div>
        <h3>Offer Info</h3>
        <List>
          <ListItem>N/A</ListItem>
        </List>
      </div>
    );
  }

  return (
    <div>
      <h3>Offer Info</h3>
      <List>
        <ListItem>
          Token Address:{' '}
          <EthereumAddress
            context={props.context}
            address={props.offerInfo.asset.tokenAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          Token ID: {props.offerInfo.asset.tokenId.toString()}
        </ListItem>
        {props.offerInfo.asset.kind == AssetKind.ERC1155 && (
          <ListItem>
            Token Quantity: {props.offerInfo.asset.tokenQuantity.toString()}
          </ListItem>
        )}
        <ListItem>
          Starting Price:{' '}
          <TokenAmount
            context={props.context}
            address={props.offerInfo.paymentTokenAddress}
            amount={props.offerInfo.startingPrice}
          />
        </ListItem>
        <ListItem>
          Market Link:{' '}
          <a href={props.offerInfo.marketLink}>{props.offerInfo.marketLink}</a>
        </ListItem>
      </List>
    </div>
  );
}
