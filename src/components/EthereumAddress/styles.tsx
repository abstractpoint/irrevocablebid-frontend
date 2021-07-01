import styled, { css } from 'styled-components';

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
