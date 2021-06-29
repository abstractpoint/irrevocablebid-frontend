import * as React from "react";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { SellerEscrowBidInfo } from "../../../lib";

import { EthereumContext } from "../../helpers";
import { EthereumAddress } from "../../components/EthereumAddress";
import { TokenAmount } from "../../components/TokenAmount";

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
        <ListItem>Guarantor: <EthereumAddress context={props.context} address={props.bidInfo.guarantorAddress} /></ListItem>
        <ListItem>Escrow: <EthereumAddress context={props.context} address={props.bidInfo.escrowAddress} /></ListItem>
        <ListItem>Price: <TokenAmount context={props.context} address={props.bidInfo.paymentTokenAddress} amount={props.bidInfo.price} /></ListItem>
      </List>
    </div>
  );
}
