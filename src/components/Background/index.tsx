import * as React from 'react';
import background from '../../assets/background.svg';

import { Container } from './styles';

/******************************************************************************/
/* Background Component */
/******************************************************************************/

export function Background(props: { children: React.ReactNode }) {
  return <Container bg={background}>{props.children}</Container>;
}
