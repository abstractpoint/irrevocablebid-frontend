import * as React from "react";

import { EthereumContext } from "../helpers";

/******************************************************************************/
/* Ethereum Address Component */
/******************************************************************************/

export function EthereumAddress(props: {context: EthereumContext; address: string;}) {
  if (!props.context.deployment) {
    return (
      <span className="ethereum-address">{props.address}</span>
    );
  }

  return (
    <a className="ethereum-address" href={props.context.deployment.explorerBaseURL + "/address/" + props.address}>{props.address}</a>
  );
}
