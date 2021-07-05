import * as React from 'react';
import styled from 'styled-components';

const LayoutDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 60px 160px;
  height: 100%;
  align-items: flex-start;
  align-content: flex-start;
`;

export const Layout = (props: { children: React.ReactNode }) => {
  return <LayoutDiv>{props.children}</LayoutDiv>;
};
