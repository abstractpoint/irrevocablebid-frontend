import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { SellerEscrowBidInfo } from '../../../lib';

import { Typography } from '../../components/Typography';
import { EthereumContext } from '../../helpers';
import { EthereumAddress } from '../../components/EthereumAddress';
import { TokenAmount } from '../../components/TokenAmount';

/******************************************************************************/
/* Bid Info Component */
/******************************************************************************/

type BidInfoProps = {
  context: EthereumContext;
  bidInfo: SellerEscrowBidInfo | null;
};

export function BidInfo(props: BidInfoProps) {
  if (!props.bidInfo) {
    return (
      <div>
        <Typography variant="h3" subVariant={'listHeading'}>
          Guaranteed Bid
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
      <Typography variant="h3" subVariant={'listHeading'}>
        Guaranteed Bid
      </Typography>
      <List>
        <ListItem>
          <Typography variant="h4" subVariant={'listItemHeading'}>
            Guarantor:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.bidInfo.guarantorAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant={'listItemHeading'}>
            Escrow:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.bidInfo.escrowAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant={'listItemHeading'}>
            Price:{' '}
          </Typography>
          <Typography variant="p">
            <TokenAmount
              context={props.context}
              address={props.bidInfo.paymentTokenAddress}
              amount={props.bidInfo.price}
            />
          </Typography>
        </ListItem>
      </List>
    </div>
  );
}
