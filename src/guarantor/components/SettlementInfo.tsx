import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { GuarantorEscrowSettlementInfo } from '../../../lib';

import { Typography } from '../../components/Typography';
import { EthereumContext } from '../../helpers';
import { TokenAmount } from '../../components/TokenAmount';

/******************************************************************************/
/* Settlement Info Component */
/******************************************************************************/

type SettlementInfoProps = {
  context: EthereumContext;
  settlementInfo: GuarantorEscrowSettlementInfo | null;
};

export function SettlementInfo(props: SettlementInfoProps) {
  if (!props.settlementInfo) {
    return (
      <div>
        <Typography variant="h3" subVariant="listHeading">
          Settlement
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
        Settlement
      </Typography>
      <List>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Sale Price:{' '}
          </Typography>
          <Typography variant="p">
            <TokenAmount
              context={props.context}
              address={props.settlementInfo.paymentTokenAddress}
              amount={props.settlementInfo.salePrice}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Service Fee:{' '}
          </Typography>
          <Typography variant="p">
            <TokenAmount
              context={props.context}
              address={props.settlementInfo.paymentTokenAddress}
              amount={props.settlementInfo.serviceFee}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Guarantor Split:{' '}
          </Typography>
          <Typography variant="p">
            <TokenAmount
              context={props.context}
              address={props.settlementInfo.paymentTokenAddress}
              amount={props.settlementInfo.guarantorAmount}
            />
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Seller Split:{' '}
          </Typography>
          <Typography variant="p">
            <TokenAmount
              context={props.context}
              address={props.settlementInfo.paymentTokenAddress}
              amount={props.settlementInfo.sellerAmount}
            />
          </Typography>
        </ListItem>
      </List>
    </div>
  );
}
