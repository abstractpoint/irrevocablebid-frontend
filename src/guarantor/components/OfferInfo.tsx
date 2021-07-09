import * as React from 'react';

import { Typography } from '../../components/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { AssetKind } from '../../../lib';
import { GuarantorEscrowOfferInfo } from '../../../lib';

import { EthereumContext } from '../../helpers';
import { TokenAmount } from '../../components/TokenAmount';
import { EthereumAddress } from '../../components/EthereumAddress';

/******************************************************************************/
/* Offer Info Component */
/******************************************************************************/

type OfferInfoProps = {
  context: EthereumContext;
  offerInfo: GuarantorEscrowOfferInfo | null;
};

export function OfferInfo(props: OfferInfoProps) {
  if (!props.offerInfo) {
    return (
      <div>
        <Typography variant="h3" subVariant="listHeading">
          Offer Info
        </Typography>
        <List>
          <ListItem>
            <Typography variant="p">N/A</Typography>
          </ListItem>
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
            Seller:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.offerInfo.sellerAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Escrow:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.offerInfo.escrowAddress}
            variant={'view'}
          />
        </ListItem>
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
            Market Link:{' '}
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
