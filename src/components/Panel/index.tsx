import * as React from 'react';
import styled from 'styled-components';

export const PanelDiv = styled.div`
  width: 560px;
  min-height: 600px;
  background: rgba(237, 179, 252, 0.07);
  border-radius: 26px;
`;

export const PanelWrapDiv = styled.div`
  padding: 26px 24px;
`;

type PanelProps = {
  children: React.ReactNode;
  style?: object;
};
export const Panel = (props: PanelProps) => {
  return <PanelDiv style={props.style}>{props.children}</PanelDiv>;
};

export const PanelWrapper = (props: { children: React.ReactNode }) => {
  return <PanelWrapDiv>{props.children}</PanelWrapDiv>;
};
