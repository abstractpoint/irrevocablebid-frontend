import * as React from "react";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { GuarantorEscrowContractInfo } from "../../../lib";

import { EthereumContext, formatExpirationTime } from "../../helpers";
import { EthereumAddress } from "../../components/EthereumAddress";

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
        <h3>Contract Info</h3>
        <List>
          <ListItem>N/A</ListItem>
        </List>
      </div>
    )
  }

  return (
    <div>
      <h3>Contract Info</h3>
      <List>
        <ListItem>Guarantor: <EthereumAddress context={props.context} address={props.contractInfo.guarantorAddress} /></ListItem>
        <ListItem>Escrow: <EthereumAddress context={props.context} address={props.contractInfo.escrowAddress} /></ListItem>
        <ListItem>Expiration Time: {formatExpirationTime(props.contractInfo.expirationTime)}</ListItem>
      </List>
    </div>
  );
}
