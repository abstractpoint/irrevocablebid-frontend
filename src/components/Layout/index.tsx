import * as React from 'react';
import { LayoutDiv } from './styles';

export const Layout = (props: { children: React.ReactNode }) => {
  return <LayoutDiv>{props.children}</LayoutDiv>;
};
