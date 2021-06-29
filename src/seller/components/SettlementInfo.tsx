import * as React from "react";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { SellerEscrowSettlementInfo } from "../../../lib";

import { EthereumContext } from "../../helpers";
import { TokenAmount } from "../../components/TokenAmount";

/******************************************************************************/
/* Settlement Info Component */
/******************************************************************************/

type SettlementInfoProps = {
  context: EthereumContext;
  settlementInfo: SellerEscrowSettlementInfo | null;
};

export function SettlementInfo(props: SettlementInfoProps) {
  if (!props.settlementInfo) {
    return (
      <div>
        <h3>Settlement</h3>
        <List>
          <ListItem>N/A</ListItem>
        </List>
      </div>
    )
  }

  return (
    <div>
      <h3>Settlement</h3>
      <List>
        <ListItem>Sale Price: <TokenAmount context={props.context} address={props.settlementInfo.paymentTokenAddress} amount={props.settlementInfo.salePrice} /></ListItem>
        <ListItem>Service Fee: <TokenAmount context={props.context} address={props.settlementInfo.paymentTokenAddress} amount={props.settlementInfo.serviceFee} /></ListItem>
        <ListItem>Guarantor Split: <TokenAmount context={props.context} address={props.settlementInfo.paymentTokenAddress} amount={props.settlementInfo.guarantorAmount} /></ListItem>
        <ListItem>Seller Split: <TokenAmount context={props.context} address={props.settlementInfo.paymentTokenAddress} amount={props.settlementInfo.sellerAmount} /></ListItem>
      </List>
    </div>
  );
}
