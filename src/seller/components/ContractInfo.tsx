import * as React from 'react';

import { Typography } from '../../components/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { SellerEscrowContractInfo } from '../../../lib';

import {
  EthereumContext,
  formatPercent,
  formatExpirationTime,
} from '../../helpers';
import { EthereumAddress } from '../../components/EthereumAddress';

/******************************************************************************/
/* Contract Info Component */
/******************************************************************************/

type ContractInfoProps = {
  context: EthereumContext;
  contractInfo: SellerEscrowContractInfo | null;
};

export function ContractInfo(props: ContractInfoProps) {
  if (!props.contractInfo) {
    return (
      <div>
        <Typography variant="h3" subVariant="listHeading">
          Contract Info
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
        Contract Info
      </Typography>
      <List>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Seller:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.contractInfo.sellerAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Escrow:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.contractInfo.escrowAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Expiration Time:{' '}
          </Typography>
          <Typography variant="p">
            {formatExpirationTime(props.contractInfo.expirationTime)}
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Split:{' '}
          </Typography>
          <Typography variant="p">
            {formatPercent(props.contractInfo.guarantorSellerSplitBasisPoints)}
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="h4" subVariant="listItemHeading">
            Service Fee:{' '}
          </Typography>
          <Typography variant="p">
            {formatPercent(props.contractInfo.serviceFeeBasisPoints)}
          </Typography>
        </ListItem>
      </List>
    </div>
  );
}
