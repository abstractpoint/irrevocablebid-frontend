import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { AssetKind } from '../../../lib';
import { SellerEscrowOfferInfo } from '../../../lib';

import { Typography } from '../../components/Typography';
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
        <Typography variant="h3" subVariant="listHeading">
          Offer Info
        </Typography>
        <List>
          <Typography variant="p">N/A</Typography>
        </List>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h3" subVariant="listHeading">
        Offer Info
      </Typography>
      <List>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Starting Price:{' '}
          </Typography>
          <Typography variant="p">
            <TokenAmount
              context={props.context}
              address={props.offerInfo.paymentTokenAddress}
              amount={props.offerInfo.startingPrice}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Market Link:
          </Typography>
          <Typography
            variant="a"
            href={props.offerInfo.marketLink}
            target="_blank"
          >
            {`${props.offerInfo.marketLink.slice(0, 24)}...`}
          </Typography>
        </ListItem>
      </List>
    </div>
  );
}
