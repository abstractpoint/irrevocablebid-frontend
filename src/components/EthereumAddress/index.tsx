import * as React from 'react';

import { EthereumContext } from '../../helpers';
import { AddressDiv, AddressLink, GreenCircle } from './styles';

/******************************************************************************/
/* Ethereum Address Component */
/******************************************************************************/

export function EthereumAddress(props: {
  context: EthereumContext;
  address: string;
}) {
  const truncateAddr = (addr: string) =>
    `${addr.slice(0, 7)}...${addr.slice(-5)}`;

  if (!props.context.deployment) {
    return (
      <AddressDiv className="ethereum-address">
        <GreenCircle />
        {truncateAddr(props.address)}
      </AddressDiv>
    );
  }

  return (
    <AddressLink
      className="ethereum-address"
      href={
        props.context.deployment.explorerBaseURL + '/address/' + props.address
      }
    >
      <GreenCircle />
      {truncateAddr(props.address)}
    </AddressLink>
  );
}
