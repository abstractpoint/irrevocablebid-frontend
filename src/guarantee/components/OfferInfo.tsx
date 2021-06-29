import * as React from "react";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { AssetKind } from "../../../lib";
import { SellerEscrowContractInfo, SellerEscrowOfferInfo } from "../../../lib";

import { EthereumContext, formatExpirationTime, formatPercent } from "../../helpers";
import { TokenAmount } from "../../components/TokenAmount";
import { EthereumAddress } from "../../components/EthereumAddress";

/******************************************************************************/
/* Offer Info Component */
/******************************************************************************/

type OfferInfoProps = {
  context: EthereumContext;
  contractInfo: SellerEscrowContractInfo | null;
  offerInfo: SellerEscrowOfferInfo | null;
};

export function OfferInfo(props: OfferInfoProps) {
  if (!props.contractInfo || !props.offerInfo) {
    return (
      <div>
        <h3>Offer Info</h3>
        <List>
          <ListItem>N/A</ListItem>
        </List>
      </div>
    )
  }

  return (
    <div>
      <h3>Offer Info</h3>
      <List>
        <ListItem>Seller: <EthereumAddress context={props.context} address={props.contractInfo.sellerAddress} /></ListItem>
        <ListItem>Escrow: <EthereumAddress context={props.context} address={props.contractInfo.escrowAddress} /></ListItem>
        <ListItem>Expiration Time: {formatExpirationTime(props.contractInfo.expirationTime)}</ListItem>
        <ListItem>Split: {formatPercent(props.contractInfo.guarantorSellerSplitBasisPoints)}</ListItem>
        <ListItem>Service Fee: {formatPercent(props.contractInfo.serviceFeeBasisPoints)}</ListItem>
        <ListItem/>
        <ListItem>Token Address: <EthereumAddress context={props.context} address={props.offerInfo.asset.tokenAddress} /></ListItem>
        <ListItem>Token ID: {props.offerInfo.asset.tokenId.toString()}</ListItem>
        {props.offerInfo.asset.kind == AssetKind.ERC1155 && <ListItem>Token Quantity: {props.offerInfo.asset.tokenQuantity.toString()}</ListItem>}
        <ListItem>Starting Price: <TokenAmount context={props.context} address={props.offerInfo.paymentTokenAddress} amount={props.offerInfo.startingPrice} /></ListItem>
        <ListItem>Market Link: <a href={props.offerInfo.marketLink}>{props.offerInfo.marketLink}</a></ListItem>
      </List>
    </div>
  );
}
