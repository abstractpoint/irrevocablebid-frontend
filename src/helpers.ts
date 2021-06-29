import * as ethers from "ethers";

import { Deployment } from "../lib";
import { SellOrder, BuyOrder } from "../lib";
import { deserializeSellOrder, deserializeBuyOrder } from "../lib";
import { validateBuyOrder, validateSellOrder, validateMatch } from "../lib";

/******************************************************************************/
/* Common Types */
/******************************************************************************/

export type EthereumContext = {
  provider?: ethers.providers.JsonRpcProvider;
  deployment?: Deployment;
};

/******************************************************************************/
/* Helper Functions */
/******************************************************************************/

export function formatPercent(basisPoints: number): string {
  return (basisPoints / 100).toFixed(2) + "%";
}

export function formatExpirationTime(timestamp: number): string {
  return (new Date(timestamp * 1000)).toString();
}

export function decodeSellOrder(deployment: Deployment, sellOrderData: string | null): SellOrder | null {
  let sellOrder: SellOrder | null = null;

  if (sellOrderData) {
      sellOrder = deserializeSellOrder(deployment, sellOrderData);
      validateSellOrder(deployment, sellOrder);
  }

  return sellOrder;
}

export function decodeBuyOrder(deployment: Deployment, sellOrder: SellOrder | null, buyOrderData: string | null): BuyOrder | null {
  if (!sellOrder)
    return null;

  let buyOrder: BuyOrder | null = null;

  if (buyOrderData) {
      buyOrder = deserializeBuyOrder(deployment, sellOrder, buyOrderData);
      validateBuyOrder(deployment, buyOrder);
      validateMatch(sellOrder, buyOrder);
  }

  return buyOrder;
}

export async function lookupTokenInfo(provider: ethers.providers.JsonRpcProvider, tokenAddress: string): Promise<{symbol: string, decimals: number}> {
  const abi = [
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];
  const erc20 = new ethers.Contract(tokenAddress, abi, provider);
  const symbol = await erc20.symbol();
  const decimals = await erc20.decimals();

  return {symbol, decimals};
}
