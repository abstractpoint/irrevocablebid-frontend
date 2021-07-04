import * as React from 'react';
import styled from 'styled-components';

const LayoutDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 60px 160px;
  height: 100%;
`;

export const Layout = (props: { children: React.ReactNode }) => {
  return <LayoutDiv>{props.children}</LayoutDiv>;
};
