import * as ethers from 'ethers';

import { Deployment } from '../lib';
import {
  ERC721Asset,
  ERC1155Asset,
  AssetKind,
  SellOrder,
  BuyOrder,
} from '../lib';
import { deserializeSellOrder, deserializeBuyOrder } from '../lib';
import { validateBuyOrder, validateSellOrder, validateMatch } from '../lib';

/******************************************************************************/
/* Common Types */
/******************************************************************************/

export type EthereumContext = {
  provider?: ethers.providers.JsonRpcProvider;
  deployment?: Deployment;
};

export type AssetInfo = {
  name: string;
  description: string;
  imageURL: string;
};

/******************************************************************************/
/* Helper Functions */
/******************************************************************************/

export function formatPercent(basisPoints: number): string {
  return (basisPoints / 100).toFixed(2) + '%';
}

export function formatExpirationTime(timestamp: number): string {
  return new Date(timestamp * 1000).toUTCString();
}

export function decodeSellOrder(
  deployment: Deployment,
  sellOrderData: string | null
): SellOrder | null {
  let sellOrder: SellOrder | null = null;

  if (sellOrderData) {
    sellOrder = deserializeSellOrder(deployment, sellOrderData);
    validateSellOrder(deployment, sellOrder);
  }

  return sellOrder;
}

export function decodeBuyOrder(
  deployment: Deployment,
  sellOrder: SellOrder | null,
  buyOrderData: string | null
): BuyOrder | null {
  if (!sellOrder) return null;

  let buyOrder: BuyOrder | null = null;

  if (buyOrderData) {
    buyOrder = deserializeBuyOrder(deployment, sellOrder, buyOrderData);
    validateBuyOrder(deployment, buyOrder);
    validateMatch(sellOrder, buyOrder);
  }

  return buyOrder;
}

export async function isWalletConnected(
  provider?: ethers.providers.JsonRpcProvider
): Promise<boolean> {
  if (!provider) return false;

  const accounts = await provider.listAccounts();
  return accounts.length > 0;
}

export async function lookupTokenInfo(
  provider: ethers.providers.JsonRpcProvider,
  tokenAddress: string
): Promise<{ symbol: string; decimals: number }> {
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
  ];
  const erc20 = new ethers.Contract(tokenAddress, abi, provider);
  const symbol = await erc20.symbol();
  const decimals = await erc20.decimals();

  return { symbol, decimals };
}

export async function lookupAssetURI(
  provider: ethers.providers.JsonRpcProvider,
  asset: ERC721Asset | ERC1155Asset
): Promise<string | null> {
  if (asset.kind == AssetKind.ERC721) {
    const abi = ['function tokenURI(uint256 _tokenId) view returns (string)'];
    const erc721 = new ethers.Contract(asset.tokenAddress, abi, provider);

    try {
      return await erc721.tokenURI(asset.tokenId);
    } catch (err) {
      return null;
    }
  } else if (asset.kind == AssetKind.ERC1155) {
    const abi = ['function uri(uint256 _id) view returns (string)'];
    const erc1155 = new ethers.Contract(asset.tokenAddress, abi, provider);

    try {
      return await erc1155.uri(asset.tokenId);
    } catch (err) {
      return null;
    }
  }

  return null;
}

export async function lookupAssetInfo(
  provider: ethers.providers.JsonRpcProvider,
  deployment: Deployment,
  asset: ERC721Asset | ERC1155Asset
): Promise<AssetInfo | null> {
  return {
    name: 'Yellow Perch',
    description: 'Photograph of a Yellow Perch.',
    imageURL:
      'https://ipfs.io/ipfs/QmeL37Yk4xkVPsA87pSGDVVGSziU9M4sCKvDFVcsccgK3c/image.jpeg',
  };
}
