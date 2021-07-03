import * as React from 'react';

import { Typography } from '../../components/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { GuarantorEscrowContractInfo } from '../../../lib';

import { EthereumContext, formatExpirationTime } from '../../helpers';
import { EthereumAddress } from '../../components/EthereumAddress';

/******************************************************************************/
/* Contract Info Component */
/******************************************************************************/

type ContractInfoProps = {
  context: EthereumContext;
  contractInfo: GuarantorEscrowContractInfo | null;
};

export function ContractInfo(props: ContractInfoProps) {
  if (!props.contractInfo) {
    return (
      <div>
        <ListItem>
          <Typography variant="p">N/A</Typography>
        </ListItem>
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
            Guarantor:{' '}
          </Typography>
          <EthereumAddress
            context={props.context}
            address={props.contractInfo.guarantorAddress}
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
      </List>
    </div>
  );
}
