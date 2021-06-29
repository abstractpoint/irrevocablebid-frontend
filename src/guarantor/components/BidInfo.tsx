import * as React from "react";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { GuarantorEscrowBidInfo } from "../../../lib";

import { EthereumContext } from "../../helpers";
import { TokenAmount } from "../../components/TokenAmount";

/******************************************************************************/
/* Bid Info Component */
/******************************************************************************/

type BidInfoProps = {
  context: EthereumContext;
  bidInfo: GuarantorEscrowBidInfo | null;
};

export function BidInfo(props: BidInfoProps) {
  if (!props.bidInfo) {
    return (
      <div>
        <h3>Guaranteed Bid</h3>
        <List>
          <ListItem>N/A</ListItem>
        </List>
      </div>
    )
  }

  return (
    <div>
      <h3>Guaranteed Bid</h3>
      <List>
        <ListItem>Price: <TokenAmount context={props.context} address={props.bidInfo.paymentTokenAddress} amount={props.bidInfo.price} /></ListItem>
      </List>
    </div>
  );
}
