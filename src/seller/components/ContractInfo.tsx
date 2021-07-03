import * as React from 'react';

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
        <h3>Contract Info</h3>
        <List>
          <ListItem>N/A</ListItem>
        </List>
      </div>
    );
  }

  return (
    <div>
      <h3>Contract Info</h3>
      <List>
        <ListItem>
          Seller:{' '}
          <EthereumAddress
            context={props.context}
            address={props.contractInfo.sellerAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          Escrow:{' '}
          <EthereumAddress
            context={props.context}
            address={props.contractInfo.escrowAddress}
            variant={'view'}
          />
        </ListItem>
        <ListItem>
          Expiration Time:{' '}
          {formatExpirationTime(props.contractInfo.expirationTime)}
        </ListItem>
        <ListItem>
          Split:{' '}
          {formatPercent(props.contractInfo.guarantorSellerSplitBasisPoints)}
        </ListItem>
        <ListItem>
          Service Fee: {formatPercent(props.contractInfo.serviceFeeBasisPoints)}
        </ListItem>
      </List>
    </div>
  );
}
