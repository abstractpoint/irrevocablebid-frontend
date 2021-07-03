import * as React from 'react';
import styled, { css } from 'styled-components';
import { EthereumContext } from '../../helpers';

/******************************************************************************/
/* Ethereum Address Component */
/******************************************************************************/

type EthereumAddressProps = {
  context: EthereumContext;
  address: string;
  variant?: string;
};

const sharedStyle = css`
  width: 218px;
  height: 57px;
  border: 1px solid #ffffff;
  box-sizing: border-box;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  border-radius: 26px;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const AddressDiv = styled.div`
  ${sharedStyle}
`;

export const AddressLink = styled.a`
  ${sharedStyle}
  text-decoration: none;
`;

export const GreenCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--neon-green);
  margin-right: 6px;
`;

const AddressView = styled.a`
  color: #ffffff;
  cursor: pointer;
`;

export function EthereumAddress(props: EthereumAddressProps) {
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
  if (props.variant === 'view') {
    return (
      <AddressView
        className="ethereum-address"
        href={
          props.context.deployment.explorerBaseURL + '/address/' + props.address
        }
        target="_blank"
      >
        {truncateAddr(props.address)}
      </AddressView>
    );
  }

  return (
    <AddressLink
      className="ethereum-address"
      href={
        props.context.deployment.explorerBaseURL + '/address/' + props.address
      }
      target="_blank"
    >
      <GreenCircle />
      {truncateAddr(props.address)}
    </AddressLink>
  );
}
